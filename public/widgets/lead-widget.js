;(() => {
	const script = document.currentScript
	if (!script) return

	const cfg = {
		mount: script.dataset.mount || '#leadWidget',
		webhook: 'https://arufefet.beget.app/webhook/calc-notify',
		successUrl: script.dataset.successUrl || 'https://homekomfort.ru/thanks', // УКАЖИ АДРЕС ТУТ
		store: script.dataset.store || 'MG-Radiators.ru',
		primary: script.dataset.primary || '#018ed2',
		border: script.dataset.border || '#1e1e1e',
		borderWidth: Number(script.dataset.borderWidth || 3),
		radius: Number(script.dataset.radius || 18),
		maxWidth: Number(script.dataset.maxWidth || 980),
		maxFileMb: 5,
		required: (script.dataset.required || 'name,email,wishes').split(',').map(x => x.trim()),
		privacyUrl: script.dataset.privacyUrl || '#',
	}

	const mountEl = document.querySelector(cfg.mount) || script.previousElementSibling || document.body
	const host = document.createElement('div')
	mountEl.appendChild(host)
	const shadow = host.attachShadow({ mode: 'open' })

	shadow.innerHTML = `
    <style>
      :host, * {
        box-sizing: border-box;
        font-family: -apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Arial, sans-serif;
        font-size: 14px;
        line-height: 1.4;
      }
      .wrap {
        position: relative;
        max-width: ${cfg.maxWidth}px;
        margin: 0 auto;
        background: #fff;
        border: ${cfg.borderWidth}px solid ${cfg.border};
        border-radius: ${cfg.radius}px;
        padding: 20px;
        overflow: hidden;
      }
      @media (max-width: 600px) {
        .wrap {
          border-width: 1px;
          padding: 12px;
        }
      }
      
      /* Overlay и Спиннер */
      .overlay {
        display: none;
        position: absolute;
        top: 0; left: 0; width: 100%; height: 100%;
        background: rgba(255, 255, 255, 0.75);
        backdrop-filter: blur(4px);
        z-index: 100;
        align-items: center;
        justify-content: center;
        flex-direction: column;
      }
      .spinner {
        width: 50px; height: 50px;
        border: 5px solid #f3f3f3;
        border-top: 5px solid ${cfg.primary};
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 15px;
      }
      @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

      .h1 { font-weight: 600; text-align: center; margin: 0 0 8px; color: #2b2b2b; }
      .p { color: #5a5a5a; max-width: 920px; margin: 0 auto 10px; text-align: center; font-size: 12px; }
      .label.small { font-size: 12px; color: #6b6b6b; font-weight: 400; }
      .sectionTitle { font-weight: 600; margin: 16px 0 6px; color:#111; }
      .desc { color: #6b6b6b; margin: 0 0 10px; font-size: 12px; }
      .label { color: #444; margin: 0 0 6px; font-size: 12px; }
      .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
      @media (max-width: 760px) { .grid2 { grid-template-columns: 1fr; } }
      .field { margin-top: 10px; }
      .field label { display:block; color: #555; margin: 0 0 6px; font-size: 12px; }
      input[type="text"], input[type="email"], textarea {
        width: 100%;
        border: 1px solid #e0e0e0;
        border-radius: 10px;
        padding: 10px 12px;
        outline: none;
        background: #fff;
      }
      textarea { min-height: 90px; resize: vertical; }
      .reqMark { color:#b00020; margin-left: 4px; }
      .checks { display:flex; flex-direction: column; gap: 10px; align-items: flex-start; margin: 12px 0 8px; }
      .check { display:flex; gap: 10px; align-items:center; color:#555; cursor: pointer; font-size: 12px; }
      .check input {
        width: 16px;
        height: 16px;
        min-width: 16px;
        min-height: 16px;
        accent-color: ${cfg.primary};
      }
      .fileRow { display:flex; align-items:center; gap: 10px; margin: 8px 0 0; color:#666; flex-wrap: wrap; }
      .fileIcon { width: 18px; height: 18px; color: #6b6b6b; }
      .fileInput { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); border: 0; }
      .fileBtn {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 8px 12px;
        border: 1px solid #d6d6d6;
        border-radius: 8px;
        background: #f7f7f7;
        color: #2b2b2b;
        cursor: pointer;
        font-weight: 600;
        transition: background 0.12s ease, border-color 0.12s ease, transform 0.12s ease;
        user-select: none;
      }
      .fileBtn:hover { background: #efefef; border-color: #c8c8c8; }
      .fileBtn:active { transform: translateY(1px); }
      .fileName { color: #666; }
      .btnRow { display:flex; justify-content:center; margin-top: 16px; }
      .consentText {
        margin-top: 10px;
        text-align: center;
        color: #7a7a7a;
        font-size: 12px;
      }
      .consentText a {
        color: ${cfg.primary};
        text-decoration: none;
        border-bottom: 1px solid rgba(0, 0, 0, 0.08);
      }
      .consentText a:hover { text-decoration: underline; }
      .btn {
        background: ${cfg.primary};
        color: #fff;
        border: none;
        border-radius: 10px;
        padding: 10px 16px;
        min-width: min(360px, 100%);
        cursor:pointer;
        font-weight: 600;
        letter-spacing: 0.2px;
        box-shadow: 0 8px 18px rgba(0, 0, 0, 0.12);
        transition: transform 0.12s ease, box-shadow 0.12s ease, filter 0.12s ease;
      }
      .btn:hover { filter: brightness(1.05); box-shadow: 0 10px 22px rgba(0, 0, 0, 0.16); }
      .btn:active { transform: translateY(1px); box-shadow: 0 6px 14px rgba(0, 0, 0, 0.12); }
      .btn:focus-visible { outline: 2px solid ${cfg.primary}; outline-offset: 2px; }
      .msg { margin-top: 10px; text-align:center; min-height: 18px; font-weight: 500; }
      .msg.ok { color: #0a7a2f; }
      .msg.err { color: #b00020; }
      .hr { height: 1px; background: #f0f0f0; margin: 14px 0; }
      .file-status { margin-top: 4px; }
    </style>

    <div class="wrap">
      <div class="overlay" id="loader">
        <div class="spinner"></div>
        <div style="font-weight: 500; color: #333;">Отправляем данные...</div>
      </div>

      <div class="sectionTitle">Как нам с Вами связаться?</div>
      <div class="desc">Выберите наиболее удобный для Вас канал, чтобы получить расчёт:</div>
      <div class="checks" id="contactMethods">
        <label class="check"><input type="checkbox" name="channels" value="whatsapp" checked> WhatsApp</label>
        <label class="check"><input type="checkbox" name="channels" value="telegram" checked> Telegram</label>
        <label class="check"><input type="checkbox" name="channels" value="email"> Email</label>
      </div>

      <div class="sectionTitle">Ваши пожелания</div>
      <div class="field">
        <label>Ваши требования и пожелания в свободной форме:<span class="reqMark">*</span></label>
        <textarea name="wishes" placeholder="Модель, цвет, размеры, бюджет..."></textarea>
      </div>

      <div class="hr"></div>

      <div class="sectionTitle">Контактная информация</div>
      <div class="field">
        <label>Как к вам можно обращаться<span class="reqMark">*</span></label>
        <input type="text" name="name" placeholder="Имя" />
      </div>

      <div class="grid2">
        <div class="field">
          <label>WhatsApp</label>
          <input type="text" name="whatsapp" placeholder="+7 (999) 123-45-67" />
        </div>
        <div class="field">
          <label>Ваша электронная почта<span class="reqMark">*</span></label>
          <input type="email" name="email" placeholder="Email" />
        </div>
      </div>

      <div class="field">
        <label>Город. Для расчёта доставки<span class="reqMark">*</span></label>
        <input type="text" name="city" placeholder="Город" />
      </div>

      <div class="field">
        <label>Прикрепите фото или смету (до 5Мб)</label>
        <input type="file" id="fileInput" class="fileInput" accept="*/*" />
        <label class="fileBtn" for="fileInput">
          <svg class="fileIcon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3v12"/><path d="m17 8-5-5-5 5"/><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/></svg>
          Выберите файл
        </label>
        <span class="fileName" id="fileName">Файл не выбран</span>
        <div id="fileNote" class="file-status" style="color:#888;"></div>
      </div>

      <div class="btnRow">
        <button class="btn" id="submitBtn">Получить расчёт стоимости</button>
      </div>
      <div class="consentText">
        Отправляя этот запрос, вы соглашаетесь с
        <a href="${cfg.privacyUrl}" target="_blank">политикой обработки персональных данных</a>.
      </div>

      <div class="msg" id="msg"></div>
    </div>
  `

	const $ = sel => shadow.querySelector(sel)
	const fileInput = $('#fileInput')
	const fileNote = $('#fileNote')
	const fileName = $('#fileName')
	const loader = $('#loader')
	const msg = $('#msg')

	// ПРОВЕРКА ФАЙЛА ПРИ ВЫБОРЕ
	fileInput.addEventListener('change', () => {
		const file = fileInput.files[0]
		if (file && file.size > 5 * 1024 * 1024) {
			fileNote.innerHTML = '<b style="color:#b00020">Файл слишком большой! Выберите файл до 5Мб.</b>'
			fileInput.value = ''
			fileName.textContent = 'Файл не выбран'
		} else if (file) {
			fileNote.innerHTML = `<span style="color:#0a7a2f">Выбран: ${file.name}</span>`
			fileName.textContent = file.name
		} else {
			fileName.textContent = 'Файл не выбран'
			fileNote.textContent = ''
		}
	})

	$('#submitBtn').addEventListener('click', async () => {
		const data = {
			name: $('input[name="name"]').value.trim(),
			email: $('input[name="email"]').value.trim(),
			city: $('input[name="city"]').value.trim(),
			wishes: $('textarea[name="wishes"]').value.trim(),
			whatsapp: $('input[name="whatsapp"]').value.trim(),
			channels: [...shadow.querySelectorAll('input[name="channels"]:checked')].map(i => i.value),
		}

		// Простая валидация
		if (cfg.required.some(key => !data[key]) || data.channels.length === 0) {
			msg.textContent = 'Пожалуйста, заполните все поля и выберите способ связи.'
			msg.className = 'msg err'
			return
		}

		loader.style.display = 'flex' // ВКЛЮЧАЕМ ЗАТЕМНЕНИЕ
		msg.textContent = ''

		try {
			const fd = new FormData()
			fd.append('store', cfg.store)
			fd.append('name', data.name)
			fd.append('email', data.email)
			fd.append('city', data.city)
			fd.append('whatsapp', data.whatsapp)
			fd.append('wishes', data.wishes)
			fd.append('channels', JSON.stringify(data.channels))
			if (fileInput.files[0]) fd.append('file', fileInput.files[0])

			const res = await fetch(cfg.webhook, { method: 'POST', body: fd })
			const result = await res.json()

			if (result.status === 'OK') {
				msg.textContent = 'Успешно! Перенаправляем...'
				msg.className = 'msg ok'
				setTimeout(() => {
					window.location.href = cfg.successUrl
				}, 600)
			} else {
				throw new Error()
			}
		} catch (e) {
			loader.style.display = 'none' // ВЫКЛЮЧАЕМ ЗАТЕМНЕНИЕ ПРИ ОШИБКЕ
			msg.textContent = 'Не удалось отправить, пожалуйста, попробуйте позже.'
			msg.className = 'msg err'
		}
	})
})()
