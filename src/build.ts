import { SortedArrayBy } from '../node_modules/@itrocks/sorted-array/sorted-array.js'

export const ALWAYS = 'always'
export const CALL   = 'call'

type BuildElementCallback<E extends Element>      = (element: E) => void
type BuildEventCall                               = typeof CALL
type BuildEventCallback<E extends BuildEventType> = (this: Element, event: ElementEventMap[E]) => any
type BuildEventType                               = keyof ElementEventMap

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

export type BuildEvent<E extends Element> = {
	args?:     any[],
	callback:  BuildElementCallback<E> | BuildEventCallback<BuildEventType>,
	type?:     BuildEventCall | BuildEventType,
	priority?: number,
	selector?: string | string[]
}

export default build
export function build<E extends Element>(callback: BuildElementCallback<E>): void
export function build<E extends Element>(event: BuildEvent<E>): void
export function build<E extends Element>(selector: string | string[], callback: BuildElementCallback<E>): void
export function build<E extends Element>(selector: string | string[], type: BuildEventCall, callback: BuildElementCallback<E>): void
export function build<E extends BuildEventType>(selector: string | string[], type: E, callback: BuildEventCallback<E>): void
export function build<E extends Element>(
	event:     BuildElementCallback<E> | BuildEvent<E> | string | string[],
	type?:     BuildElementCallback<E> | BuildEventCall | BuildEventType,
	callback?: BuildElementCallback<E> | BuildEventCallback<BuildEventType>
) {
	if (typeof event === 'function') {
		event = { callback: event }
	}
	else if ((typeof event === 'string') || Array.isArray(event)) {
		event = callback
			? { callback, type, selector: event } as BuildEvent<E>
			: { callback: type, selector: event } as BuildEvent<E>
	}
	if (!event.args)     event.args     = []
	if (!event.type)     event.type     = CALL
	if (!event.priority) event.priority = 1000
	if (!event.selector) event.selector = ALWAYS

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
