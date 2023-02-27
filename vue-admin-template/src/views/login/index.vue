<template>
  <div class="login-container">
    <!--登录 -->
    <transition name="slide-fade" appear>
      <el-form
        v-if="loginFlag === 2"
        ref="loginForm"
        :model="loginForm"
        :rules="loginRules"
        class="login-form"
        auto-complete="on"
        label-position="left"
      >
        <div class="title-container">
          <h3 class="title">登 录</h3>
        </div>

        <el-form-item prop="username">
          <el-input
            ref="username"
            v-model="loginForm.username"
            placeholder="请输入账号"
            name="username"
            clearable
            type="text"
          >
            <svg-icon
              slot="prefix"
              icon-class="user"
              class="el-input__icon input-icon"
            />
          </el-input>
        </el-form-item>

        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            placeholder="请输入密码"
            clearable
            name="password"
            show-password
            tabindex="2"
            @keyup.enter.native="handleLogin"
          >
            <svg-icon
              slot="prefix"
              icon-class="password"
              class="el-input__icon input-icon"
            />
          </el-input>
        </el-form-item>
        <el-form-item prop="captch">
          <el-input
            v-model="loginForm.captch"
            placeholder="请输入验证码"
            maxlength="4"
            name="captch"
            @keyup.enter.native="handleLogin"
          >
            <svg-icon
              slot="prefix"
              icon-class="captcha"
              class="el-input__icon input-icon"
            />
          </el-input>
          <div class="captch" @click="getCaptch" v-html="svgCaptch" />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="checked">记住密码</el-checkbox>
        </el-form-item>
        <el-button
          :loading="loading"
          type="primary"
          class="common-btn"
          @click.native.prevent="handleLogin"
          >登录</el-button
        >
        <el-link
          class="register"
          :underline="false"
          @click="changeForm('loginForm', 1)"
          >没有账号？马上创建</el-link
        >
      </el-form>
    </transition>
    <!-- 注册 -->
    <transition name="slide-fade" appear>
      <el-form
        v-if="loginFlag === 1"
        ref="registerForm"
        :model="registerForm"
        :rules="registerRules"
        class="login-form"
        auto-complete="on"
        label-position="left"
      >
        <div class="title-container">
          <h3 class="title">注 册</h3>
        </div>
        <el-form-item prop="username">
          <el-input
            ref="username"
            v-model="registerForm.username"
            placeholder="请输入账号"
            name="username"
            type="text"
            clearable
            tabindex="1"
            auto-complete="on"
          >
            <svg-icon
              slot="prefix"
              icon-class="user"
              class="el-input__icon input-icon"
            />
          </el-input>
        </el-form-item>
        <el-form-item prop="email">
          <el-input
            v-model="registerForm.email"
            clearable
            placeholder="请输入邮箱"
          >
            <svg-icon
              slot="prefix"
              icon-class="email"
              class="el-input__icon input-icon"
            />
          </el-input>
        </el-form-item>
        <el-form-item prop="phone">
          <el-input
            v-model="registerForm.phone"
            clearable
            placeholder="请输入电话"
          >
            <svg-icon
              slot="prefix"
              icon-class="phone"
              class="el-input__icon input-icon"
            />
          </el-input>
        </el-form-item>
        <el-form-item prop="sex">
          <el-radio-group v-model="registerForm.sex">
            <el-radio border :label="0">男</el-radio>
            <el-radio border :label="1">女</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="registerForm.password"
            placeholder="请输入密码"
            clearable
            show-password
          >
            <svg-icon
              slot="prefix"
              icon-class="password"
              class="el-input__icon input-icon"
            />
          </el-input>
        </el-form-item>
        <el-form-item prop="checkPwd">
          <el-input
            v-model="registerForm.checkPwd"
            placeholder="请确认密码"
            clearable
            show-password
          >
            <svg-icon
              slot="prefix"
              icon-class="password"
              class="el-input__icon input-icon"
            />
          </el-input>
        </el-form-item>
        <el-form-item prop="captch">
          <el-input
            v-model="registerForm.captch"
            placeholder="请输入验证码"
            maxlength="4"
            name="captch_register"
          >
            <svg-icon
              slot="prefix"
              icon-class="captcha"
              class="el-input__icon input-icon"
            />
          </el-input>
          <div class="captch" @click="getCaptch" v-html="svgCaptch" />
        </el-form-item>
        <el-button
          :loading="loading"
          type="primary"
          class="common-btn"
          @click.native.prevent="handleRegister"
          >注册</el-button
        >
        <el-link
          class="register"
          :underline="false"
          @click="changeForm('registerForm', 2)"
          >已有帐号，返回登录</el-link
        >
      </el-form>
    </transition>
  </div>
</template>

<script>
import * as HTTP from "@/api/user";
export default {
  name: "Login",
  data() {
    // 账号不能为中文
    const validateName = (rule, value, callback) => {
      if (value !== "") {
        if (/[\u4E00-\u9FA5]/g.test(value)) {
          callback(new Error("账号不能为中文"));
        } else {
          callback();
        }
      }
      callback(new Error("账号不能为空"));
    };
    // 电话
    const validatePhone = (rule, value, callback) => {
      if (value !== "") {
        if (!/^1[3456789]\d{9}$/.test(value)) {
          callback(new Error("电话格式错误"));
        } else {
          callback();
        }
      }
      callback(new Error("电话不能为空"));
    };
    // 密码
    const validatePassword = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("密码不能为空"));
      } else {
        if (value.length < 6) {
          callback(new Error("密码应为六位以上数字、字母的组合"));
        } else {
          callback();
        }
      }
    };
    // 确认密码-注册
    const validateCheckPwd = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请确认密码"));
      } else {
        if (value === this.registerForm.password) {
          callback();
        }
        callback(new Error("两次输入的密码不一致"));
      }
    };
    return {
      loginForm: {
        username: "",
        password: "",
        captch: "",
      },
      registerForm: {
        username: "",
        password: "",
        checkPwd: "",
        email: "",
        sex: "",
        phone: "",
        captch: "",
      },
      loginRules: {
        username: [
          { required: true, trigger: "blur", message: "用户名不能为空" },
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword },
        ],
        captch: [
          { required: true, trigger: "blur", message: "验证码不能为空" },
        ],
      },
      registerRules: {
        username: [
          { required: true, trigger: "blur", message: "账号不能为空" },
        ],
        password: [
          { required: true, trigger: "blur", validator: validatePassword },
        ],
        checkPwd: [
          { required: true, trigger: "blur", validator: validateCheckPwd },
        ],
        phone: [{ required: true, trigger: "blur", validator: validatePhone }],
        sex: [{ required: true, trigger: "blur", message: "性别为必选" }],
        email: [
          { required: true, message: "请输入邮箱", trigger: "blur" },
          {
            type: "email",
            message: "请输入正确的邮箱地址",
            trigger: ["blur", "change"],
          },
        ],
        captch: [
          { required: true, trigger: "blur", message: "验证码不能为空" },
        ],
      },
      loading: false,
      loginFlag: 2, // 0：密码修改 1：创建账号 2：登录（默认初始状态）
      redirect: undefined,
      multiple: false, // 控制是否可以多选
      svgCaptch: "", // 存储图片验证码
      checked: false,
      captchID: null, // 存储图片验证码ID
    };
  },
  watch: {
    $route: {
      handler: function (route) {
        this.redirect = route.query && route.query.redirect;
      },
      immediate: true,
    },
  },
  mounted() {
    const temp = JSON.parse(
      localStorage.getItem(location.host + "/coronal" + "/account")
    );
    if (temp !== null) {
      this.loginForm.username = temp.username;
      this.loginForm.password = temp.password;
      this.checked = true;
    } else {
      this.checked = false;
    }
    this.getCaptch(); // 获取验证码
  },
  methods: {
    // 获取验证码
    getCaptch() {
      HTTP.getCaptch({ create_time: this.dateFormat("") }).then((res) => {
        if (res.code === 200) {
          this.svgCaptch = res.captch.captch;
          this.captchID = res.captch.id;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 登陆操作执行
    handleLogin() {
      this.$refs.loginForm.validate((valid) => {
        if (valid) {
          this.loading = true;
          const params = {
            login_time: this.dateFormat(""),
            captchID: this.captchID,
            ...this.loginForm,
          };
          params.password = this.$md5(this.loginForm.password);
          this.$store
            .dispatch("user/login", params)
            .then((res) => {
              if (res.code === 200) {
                sessionStorage.setItem(
                  location.host + "/coronal" + "/info",
                  JSON.stringify(res.results)
                );
                if (this.checked) {
                  // 缓存用户名密码
                  const params = {
                    password: this.loginForm.password,
                    username: this.loginForm.username,
                  };
                  localStorage.setItem(
                    location.host + "/coronal" + "/account",
                    JSON.stringify(params)
                  );
                } else {
                  localStorage.removeItem(
                    location.host + "/coronal" + "/account"
                  );
                }
                // 手动更新一次动态路由
                this.$store.dispatch("user/getInfo").then((res) => {
                  const { roles } = res;
                  this.$store
                    .dispatch("permission/generateRoutes", roles)
                    .then((response) => {
                      const accessRoutes = response;
                      accessRoutes.push({
                        path: "*",
                        redirect: "/404",
                        hidden: true,
                      }); // 动态加入404页面在最后，在未匹配路由时会跳转404页面，否则为空白页面
                      this.$router.addRoutes(accessRoutes);
                      this.$router.push({
                        path: "/",
                        query: this.otherQuery,
                      });
                    });
                });
              } else {
                this.getCaptch(); // 更新验证码
                this.$message.warning(res.msg);
              }
              this.loading = false;
            })
            .catch(() => {
              this.getCaptch(); // 更新验证码
              this.loading = false;
            });
        } else {
          return false;
        }
      });
    },
    // 注册操作执行
    handleRegister() {
      this.$refs["registerForm"].validate((valid) => {
        if (valid) {
          const params = {
            register_time: this.dateFormat(""),
            captchID: this.captchID,
            ...this.registerForm,
          };
          params.password = this.$md5(params.password);
          delete params.checkPwd;
          HTTP.register(params)
            .then((res) => {
              if (res.code === 200) {
                this.$message.success(res.msg);
                this.changeForm("registerForm", 2); // 返回登录
              } else {
                this.getCaptch(); // 更新验证码
                this.$message.warning(res.msg);
              }
            })
            .catch(() => {
              this.getCaptch(); // 更新验证码
            });
        }
      });
    },
    // 切换显示
    changeForm(form, type) {
      this.resetForm(form);
      this.loginFlag = type; // 1：创建账号 2：登录（默认初始状态）
      this.getCaptch(); // 更新验证码
    },
    // 重置rules规则
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
  },
};
</script>

<style lang="scss">
.login-container {
  .el-input__prefix {
    left: 15px;
  }
  .el-input--prefix .el-input__inner {
    padding-left: 40px;
  }
  .el-select {
    width: 100%;
  }
  .el-input__inner {
    padding-right: 100px;
  }
}
</style>

<style lang="scss" scoped>
$bg: #2d3a4b;
$dark_gray: #889aa4;
$light_gray: #eee;

/* 位移 name="slide-fade"*/
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 1s;
}
.slide-fade-enter, .slide-fade-leave-to
/* .slide-fade-leave-active 用于 2.1.8 以下版本 */ {
  transform: translateY(30px);
  opacity: 0;
}
.login-container {
  min-height: 100%;
  width: 100%;
  // background: url('../../assets/bg3.png');
  background-color: #2e3f56;
  background-size: cover;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;

  .login-form {
    position: absolute;
    width: 470px;
    max-width: 100%;
    border: 1px solid rgb(255 255 255 / 50%);
    background: rgb(255 255 255 / 50%);
    border-radius: 5px;
    padding: 20px 50px;
  }

  .title-container {
    position: relative;

    .title {
      font-size: 26px;
      color: #409eff;
      margin: 0px auto 40px auto;
      text-align: center;
      font-weight: bold;
    }
  }

  .captch {
    position: absolute;
    top: 0;
    right: 0;
    height: 40px;
    cursor: pointer;
  }
  .show-pwd {
    position: absolute;
    right: 10px;
    top: 7px;
    font-size: 16px;
    color: $dark_gray;
    cursor: pointer;
    user-select: none;
  }
  .common-btn {
    width: 100%;
    margin-bottom: 20px;
  }
  .register {
    color: #409eff;
    float: right;
  }
  .register:hover {
    color: #75b6f8;
  }
}
</style>
