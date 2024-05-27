<script>
	import { loginOn } from './../../store/userSlice.js';
	import { login } from './../../compositions/user.js';
	import { modalUI } from './../../compositions/ui.js';
	import { modal_login } from '../../store/modalSlice.js';
  import { cookies } from '../../cookies.js';

  const { close } = modal_login;
  let modalEle = null;
  let memb = {
    id: "",
    password: "",
  }
  let alertMent = "";

  $: if($modal_login) {
    modalUI.open(modalEle);
    document.getElementById('loginId').focus();
    document.addEventListener('keydown', escClose);
  } else {
    modalUI.close(modalEle);
    resetForm();
    document.removeEventListener('keydown', escClose);
  };
  const escClose = (e) => {
        if(e.key === 'Escape' || e.key === 'Esc' || e.keyCode === 27) {
            close();
        }
    }
  
  const resetForm = () => {
    memb.id = "";
    memb.password = "";
    alertMent = "";
  }

  const login_before = () => {
    login(memb).then(({data}) => {
      cookies.set('adminLogin', 'on', 60 * 60 * 24);
      loginOn.login(data.access_token, data.refresh_token, data.exception === 'ADMIN' ? true : false);
      close();
    }).catch((err) => {
      console.log(err);
      alertMent = "아이디 또는 비밀번호가 틀렸습니다."
    });
  }

  
</script>

<div class="modal" bind:this={modalEle}>
  <button
    class="modal-background"
    on:click={close}
  ></button>
  <div class="modal-board">
    <div class="modal-content">
      <div class="modal-title">관리자 로그인</div>
      <div class="modal-con">
        <form on:submit|preventDefault={login_before}>
          <div class="login-form">
            <div>
              <label for="loginId">아이디 : </label>
              <input id="loginId" type="text" bind:value={memb.id}>
            </div>
            <div>
              <label for="loginId">비밀번호 : </label>
              <input type="password" bind:value={memb.password} autocomplete="false">
            </div>
          </div>
          <div class="login-btn">
            <input type="submit" value="로그인">
          </div>
        </form>
        <p class="c_red">{alertMent}</p>
      </div>
      <div class="modal-btn_wrap">
        <button
          type="button"
          class="modal_close"
          on:click={close}
        >
          닫기
        </button>
      </div>
    </div>
  </div>
</div>


<style>
  .modal-con>form {
    display: flex;
    flex-wrap: nowrap;
  }
  .modal-con>form div {
    padding: 10px 0;
    font-size: 18px;
  }
  .modal-con>form .login-form {
    width:70%;
  }
  .modal-con>form .login-form label {
    width:28%;
  }
  .modal-con>form .login-form input {
    width:70%;
    height: 40px;
  }
  .modal-con>form .login-btn {
    width:30%;
    padding:20px 10px 10px 10px;
  }
  .modal-con>form .login-btn input {
    width: 100px;
    height: 100px;
  }
</style>