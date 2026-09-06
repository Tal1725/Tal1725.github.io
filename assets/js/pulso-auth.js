/* PULSO — autenticação real com Supabase */
(function () {
  'use strict';

  const SUPABASE_URL = 'https://vqpavcyehgdifbtvzhcn.supabase.co';
  const SUPABASE_KEY = 'sb_publishable_915zO84U7fk0ZAjE4vdsFQ_yRWDA6Cm';

  function boot() {
    if (!window.supabase || window.__PULSO_AUTH_READY) return;
    window.__PULSO_AUTH_READY = true;
    const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
    window.PULSO_AUTH = client;

    const style = document.createElement('style');
    style.textContent = `
      .pulso-auth-backdrop{position:fixed;inset:0;z-index:99999;display:none;align-items:center;justify-content:center;padding:20px;background:rgba(3,4,10,.78);backdrop-filter:blur(14px)}
      .pulso-auth-backdrop.open{display:flex}
      .pulso-auth{width:min(440px,100%);max-height:min(720px,92vh);overflow:auto;background:#0b0d16;border:1px solid rgba(255,255,255,.12);border-radius:24px;box-shadow:0 30px 100px rgba(0,0,0,.55);padding:28px;color:#fff;font-family:Inter,system-ui,sans-serif;position:relative}
      .pulso-auth h3{margin:0 0 7px;font-size:28px;letter-spacing:-.03em}.pulso-auth p{color:#aeb4c7;margin:0 0 20px;line-height:1.5}
      .pulso-auth-close{position:absolute;right:16px;top:14px;width:38px;height:38px;border:0;border-radius:50%;background:rgba(255,255,255,.07);color:#fff;font-size:24px;cursor:pointer}
      .pulso-auth label{display:block;font-size:13px;font-weight:600;margin:14px 0 7px;color:#dfe3ef}.pulso-auth input{width:100%;box-sizing:border-box;border:1px solid rgba(255,255,255,.13);background:#121521;color:#fff;border-radius:12px;padding:13px 14px;outline:none;font-size:15px}.pulso-auth input:focus{border-color:#8c7bff;box-shadow:0 0 0 3px rgba(140,123,255,.14)}
      .pulso-auth-submit{width:100%;border:0;border-radius:13px;padding:14px;margin-top:18px;background:linear-gradient(135deg,#8c7bff,#5ce1e6);color:#05060b;font-weight:800;font-size:15px;cursor:pointer}.pulso-auth-submit:disabled{opacity:.55;cursor:wait}
      .pulso-auth-switch{display:flex;gap:8px;justify-content:center;margin-top:18px;font-size:13px}.pulso-auth-switch button,.pulso-auth-link{border:0;background:none;color:#9d91ff;cursor:pointer;font-weight:700}.pulso-auth-msg{min-height:22px;margin-top:13px!important;margin-bottom:0!important;font-size:13px}.pulso-auth-msg.error{color:#ff8f9c}.pulso-auth-msg.ok{color:#72e6ad}
      .pulso-user-badge{position:fixed;right:18px;bottom:18px;z-index:9998;display:none;align-items:center;gap:10px;background:rgba(11,13,22,.94);border:1px solid rgba(255,255,255,.12);border-radius:999px;padding:8px 12px 8px 8px;color:#fff;box-shadow:0 12px 35px rgba(0,0,0,.3);font:600 13px Inter,system-ui,sans-serif}.pulso-user-badge.show{display:flex}.pulso-user-avatar{width:32px;height:32px;border-radius:50%;display:grid;place-items:center;background:linear-gradient(135deg,#8c7bff,#5ce1e6);color:#05060b;font-weight:900}.pulso-user-exit{border:0;background:none;color:#aeb4c7;cursor:pointer;font-size:12px;margin-left:4px}
      .pulso-auth-account{display:flex;gap:8px;margin-top:12px}.pulso-auth-account button{flex:1;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.05);color:#fff;border-radius:11px;padding:10px;cursor:pointer;font-weight:700}
    `;
    document.head.appendChild(style);

    const backdrop = document.createElement('div');
    backdrop.className = 'pulso-auth-backdrop';
    backdrop.innerHTML = `
      <div class="pulso-auth" role="dialog" aria-modal="true" aria-labelledby="pulsoAuthTitle">
        <button class="pulso-auth-close" type="button" aria-label="Fechar">×</button>
        <h3 id="pulsoAuthTitle">Entre no PULSO</h3>
        <p id="pulsoAuthSubtitle">Crie sua conta e faça parte do que está acontecendo agora.</p>
        <form id="pulsoAuthForm" novalidate>
          <div id="pulsoNameWrap"><label for="pulsoName">Nome</label><input id="pulsoName" autocomplete="name" placeholder="Seu nome"></div>
          <div id="pulsoUserWrap"><label for="pulsoUser">@Usuário</label><input id="pulsoUser" autocomplete="username" placeholder="seuusuario"></div>
          <label for="pulsoEmail">E-mail</label><input id="pulsoEmail" type="email" autocomplete="email" placeholder="voce@email.com" required>
          <label for="pulsoPassword">Senha</label><input id="pulsoPassword" type="password" autocomplete="new-password" placeholder="Mínimo de 6 caracteres" required minlength="6">
          <div id="pulsoConfirmWrap"><label for="pulsoConfirm">Confirmar senha</label><input id="pulsoConfirm" type="password" autocomplete="new-password" placeholder="Digite novamente"></div>
          <button id="pulsoAuthSubmit" class="pulso-auth-submit" type="submit">Criar minha conta</button>
        </form>
        <p id="pulsoAuthMsg" class="pulso-auth-msg" aria-live="polite"></p>
        <div class="pulso-auth-switch"><span id="pulsoSwitchText">Já tem conta?</span><button id="pulsoSwitch" type="button">Entrar</button></div>
        <div class="pulso-auth-account"><button id="pulsoForgot" type="button">Esqueci minha senha</button></div>
      </div>`;
    document.body.appendChild(backdrop);

    const form = document.getElementById('pulsoAuthForm');
    const title = document.getElementById('pulsoAuthTitle');
    const subtitle = document.getElementById('pulsoAuthSubtitle');
    const nameWrap = document.getElementById('pulsoNameWrap');
    const userWrap = document.getElementById('pulsoUserWrap');
    const confirmWrap = document.getElementById('pulsoConfirmWrap');
    const submit = document.getElementById('pulsoAuthSubmit');
    const msg = document.getElementById('pulsoAuthMsg');
    const switchBtn = document.getElementById('pulsoSwitch');
    const switchText = document.getElementById('pulsoSwitchText');
    const forgot = document.getElementById('pulsoForgot');
    const close = backdrop.querySelector('.pulso-auth-close');
    let mode = 'signup';

    function message(text, type) { msg.textContent = text || ''; msg.className = 'pulso-auth-msg' + (type ? ' ' + type : ''); }
    function open(nextMode) { mode = nextMode || 'signup'; renderMode(); backdrop.classList.add('open'); document.body.style.overflow='hidden'; setTimeout(()=>document.getElementById('pulsoEmail').focus(),50); }
    function shut() { backdrop.classList.remove('open'); document.body.style.overflow=''; message(''); form.reset(); }
    function renderMode() {
      const signup = mode === 'signup';
      const recovery = mode === 'recovery';
      nameWrap.style.display = signup ? '' : 'none'; userWrap.style.display = signup ? '' : 'none'; confirmWrap.style.display = signup ? '' : 'none';
      title.textContent = signup ? 'Entre no PULSO' : (recovery ? 'Recupere sua senha' : 'Bem-vindo de volta');
      subtitle.textContent = signup ? 'Crie sua conta e faça parte do que está acontecendo agora.' : (recovery ? 'Digite seu e-mail e enviaremos um link para redefinir sua senha.' : 'Entre na sua conta para continuar no PULSO.');
      submit.textContent = signup ? 'Criar minha conta' : (recovery ? 'Enviar link de recuperação' : 'Entrar');
      switchText.textContent = recovery ? 'Lembrou a senha?' : (signup ? 'Já tem conta?' : 'Ainda não tem conta?');
      switchBtn.textContent = recovery ? 'Entrar' : (signup ? 'Entrar' : 'Criar conta');
      forgot.style.display = recovery ? 'none' : '';
      document.getElementById('pulsoPassword').style.display = recovery ? 'none' : '';
    }

    document.addEventListener('click', (e) => {
      const a = e.target.closest('a[href="#download"]');
      if (a) { e.preventDefault(); open('signup'); }
      const authBtn = e.target.closest('[data-pulso-auth]');
      if (authBtn) { e.preventDefault(); open(authBtn.dataset.pulsoAuth || 'signup'); }
    });
    close.addEventListener('click', shut);
    backdrop.addEventListener('click', e => { if (e.target === backdrop) shut(); });
    document.addEventListener('keydown', e => { if (e.key === 'Escape' && backdrop.classList.contains('open')) shut(); });
    switchBtn.addEventListener('click', () => open(mode === 'signup' ? 'login' : 'signup'));
    forgot.addEventListener('click', () => open('recovery'));

    form.addEventListener('submit', async (e) => {
      e.preventDefault(); message(''); submit.disabled = true;
      try {
        const email = document.getElementById('pulsoEmail').value.trim();
        const password = document.getElementById('pulsoPassword').value;
        if (!email) throw new Error('Digite seu e-mail.');
        if (mode !== 'recovery' && password.length < 6) throw new Error('A senha precisa ter pelo menos 6 caracteres.');

        if (mode === 'recovery') {
          const { error } = await client.auth.resetPasswordForEmail(email, { redirectTo: window.location.origin + window.location.pathname });
          if (error) throw error;
          message('Enviamos as instruções de recuperação para seu e-mail.', 'ok');
          return;
        }

        if (mode === 'signup') {
          const name = document.getElementById('pulsoName').value.trim();
          const username = document.getElementById('pulsoUser').value.trim().toLowerCase().replace(/[^a-z0-9_]/g,'');
          const confirm = document.getElementById('pulsoConfirm').value;
          if (!name) throw new Error('Digite seu nome.');
          if (username.length < 3) throw new Error('O @usuário precisa ter pelo menos 3 caracteres.');
          if (password !== confirm) throw new Error('As senhas não conferem.');
          const { data, error } = await client.auth.signUp({ email, password, options: { data: { display_name: name, username: username } } });
          if (error) throw error;
          if (data.session) { message('Conta criada! Você já está conectado ao PULSO.', 'ok'); shut(); updateUser(data.user); }
          else message('Conta criada! Confira seu e-mail para confirmar o cadastro.', 'ok');
          return;
        }

        const { data, error } = await client.auth.signInWithPassword({ email, password });
        if (error) throw error;
        message('Login realizado com sucesso.', 'ok');
        setTimeout(() => { shut(); updateUser(data.user); }, 500);
      } catch (err) {
        message(err && err.message ? err.message : 'Não foi possível concluir. Tente novamente.', 'error');
      } finally { submit.disabled = false; }
    });

    const badge = document.createElement('div');
    badge.className = 'pulso-user-badge';
    badge.innerHTML = '<span class="pulso-user-avatar">P</span><span class="pulso-user-name"></span><button class="pulso-user-exit" type="button">Sair</button>';
    document.body.appendChild(badge);
    badge.querySelector('.pulso-user-exit').addEventListener('click', async () => { await client.auth.signOut(); updateUser(null); });

    function updateUser(user) {
      if (!user) { badge.classList.remove('show'); return; }
      const meta = user.user_metadata || {};
      badge.querySelector('.pulso-user-name').textContent = meta.username ? '@' + meta.username : (meta.display_name || user.email || 'Usuário');
      badge.querySelector('.pulso-user-avatar').textContent = (meta.display_name || user.email || 'P').charAt(0).toUpperCase();
      badge.classList.add('show');
    }

    client.auth.getSession().then(({ data }) => updateUser(data.session ? data.session.user : null));
    client.auth.onAuthStateChange((_event, session) => updateUser(session ? session.user : null));
    renderMode();
  }

  if (window.supabase) boot();
  else {
    const s = document.createElement('script');
    s.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    s.onload = boot;
    s.onerror = () => console.error('PULSO: não foi possível carregar o cliente Supabase.');
    document.head.appendChild(s);
  }
})();
