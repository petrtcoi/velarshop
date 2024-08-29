setTimeout(function () {
	var _tmr = window._tmr || (window._tmr = [])
	_tmr.push({ id: '{{counterId}}', type: 'pageView', start: new Date().getTime() })

	;(function (d, w, id) {
		if (d.getElementById(id)) return
		var ts = d.createElement('script')
		ts.type = 'text/javascript'
		ts.async = true
		ts.id = id
		ts.src = 'https://top-fwz1.mail.ru/js/code.js'
		var f = function () {
			var s = d.getElementsByTagName('script')[0]
			s.parentNode.insertBefore(ts, s)
		}
		if (w.opera == '[object Opera]') {
			d.addEventListener('DOMContentLoaded', f, false)
		} else {
			f()
		}
	})(document, window, 'tmr-code')
}, 3000)
