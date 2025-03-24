import { SortedArrayBy } from '../node_modules/@itrocks/sorted-array/sorted-array.js'

export const ALWAYS = 'always'
export const CALL   = 'call'

type BuildEventCall = typeof CALL
type BuildEventType = keyof GlobalEventHandlersEventMap

type BuildElementCallback<E extends Element>
	= (element: E) => any
type BuildEventCallback<E extends Element, V extends BuildEventType>
	= (this: E, event: GlobalEventHandlersEventMap[V]) => any

class Callback
{

	constructor(
		public event:     BuildEventCall | BuildEventType,
		public selectors: string[],
		public callback:  (...args: any[]) => any,
		public priority:  number,
		public args:      any[]
	) {
	}

	applyInto(containerElement: Element)
	{
		for (const element of this.matchingElementsInto(containerElement)) {
			if (this.event === CALL) {
				this.callback(element, ...this.args)
			}
			else {
				element.addEventListener(this.event, this.callback)
			}
		}
	}

	matchingElementsInto(element: Element): Set<Element>
	{
		const elements = new Set<Element>
		for (const selector of this.selectors) {
			if ((selector[0] === ALWAYS[0]) && (selector === ALWAYS)) {
				elements.add(element)
				continue
			}
			if (element.matches(selector)) {
				elements.add(element)
			}
			element.querySelectorAll(selector).forEach(element => elements.add(element))
		}
		return elements
	}

}

const callbacks = new SortedArrayBy<Callback>('priority')

const chainedSelectors = (selector: string[]) =>
{
	const selectors = ['']
	for (const sourcePart of selector) {
		const addParts = sourcePart.split(',')
		const addPart  = addParts.pop()
		const length   = selectors.length
		for (const oldPart of selectors) {
			for (const addPart of addParts) {
				selectors.push(oldPart + ' ' + addPart)
			}
		}
		for (let index = 0; index < length; index ++) {
			selectors[index] += ' ' + addPart
		}
	}
	return selectors
}

export type BuildEvent<E extends Element, V extends BuildEventCall | BuildEventType> = {
	args?:     any[],
	callback:  V extends BuildEventType ? BuildEventCallback<E, V> : BuildElementCallback<E>,
	type?:     V,
	priority?: number,
	selector?: string | string[]
}

export function build<E extends Element>(callback: BuildElementCallback<E>): void
export function build<E extends Element, V extends BuildEventCall | BuildEventType>(event: BuildEvent<E, V>): void
export function build<E extends Element>(selector: string | string[], callback: BuildElementCallback<E>): void
export function build<E extends Element>(
	selector: string | string[],
	type:     BuildEventCall,
	callback: BuildElementCallback<E>
): void
export function build<E extends Element, V extends BuildEventCall | BuildEventType>(
	selector: string | string[],
	type:     V,
	callback: V extends BuildEventType ? BuildEventCallback<E, V> : BuildElementCallback<E>
): void
export function build<E extends Element, V extends BuildEventCall | BuildEventType>(
	event:     BuildElementCallback<E> | BuildEvent<E, V> | string | string[],
	type?:     BuildElementCallback<E> | V,
	callback?: V extends BuildEventType ? BuildEventCallback<E, V> : BuildElementCallback<E>
) {
	if (typeof event === 'function') {
		event = { callback: event } as BuildEvent<E, V>
	}
	else if ((typeof event === 'string') || Array.isArray(event)) {
		event = (callback ? { callback, type, selector: event } : { callback: type, selector: event }) as BuildEvent<E, V>
	}
	if (!event.args)     event.args     = []
	if (!event.priority) event.priority = 1000
	if (!event.selector) event.selector = ALWAYS
	if (!event.type)     event.type     = CALL as V

	event.priority = (event.priority * 1000000) + callbacks.length
	event.selector = (typeof event.selector === 'string') ? [event.selector] : chainedSelectors(event.selector)

	const buildCallback = new Callback(event.type, event.selector, event.callback, event.priority ?? 0, event.args)
	buildCallback.applyInto(document.body)
	callbacks.push(buildCallback)
}

const observer = new MutationObserver(mutations => {
	for (const mutation of mutations) {
		mutation.addedNodes.forEach(addedNode => {
			if ((addedNode instanceof HTMLElement) && addedNode.closest('html')) {
				for (const callback of callbacks) {
					callback.applyInto(addedNode)
				}
			}
		})
	}
})

observer.observe(document.body, { childList: true, subtree: true })
