import build from '../src/build.js'

build('main article #div #active', active => active.setAttribute('title', 'Title dynamically added'))

build({ selector: '#active', type: 'click', callback: event => console.log('click #active', event) })

build('div.a', 'click', event => console.log('click .a', event))

build(element => console.log('new element', element))

document.getElementById('change')?.addEventListener('click', () => {
	const div = document.getElementById('div')
	if (!div) return
	div.innerHTML = '<div><div id="active">This is active content</div></div><div class="a">Another one</div>'
})
