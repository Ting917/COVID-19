<template>
  <el-form
    ref="formRules"
    :model="formRules"
    :inline="false"
    class="profile"
    label-width="90px"
    :rules="rules"
  >
    <el-form-item label="用户名:" prop="account">
      <span v-if="!editAble">{{ formRules.account }}</span>
      <el-input v-else v-model="formRules.account" size="small" clearable placeholder="请输入用户名" />
    </el-form-item>
    <el-form-item label="邮箱:" prop="email">
      <span v-if="!editAble">{{ formRules.email }}</span>
      <el-input v-else v-model="formRules.email" size="small" clearable placeholder="请输入邮箱" />
    </el-form-item>
    <el-form-item label="电话:" prop="phone">
      <span v-if="!editAble">{{ formRules.phone }}</span>
      <el-input v-else v-model="formRules.phone" size="small" clearable placeholder="请输入邮箱" />
    </el-form-item>
    <el-form-item label="性别:" prop="sex">
      <span v-if="!editAble">{{ formRules.sex === 0 ? '男' : '女' }}</span>
      <el-select v-else v-model="formRules.sex" size="small" clearable placeholder="请选择性别">
        <el-option :value="0" label="男">男</el-option>
        <el-option :value="1" label="女">女</el-option>
      </el-select>
    </el-form-item>
    <el-form-item label="权限:">
      <span v-if="formRules.roles === 0">管理员</span>
      <span v-if="formRules.roles === 1">用户</span>
      <img v-if="formRules.roles === 0" src="../../../assets/fire.png" style="margin-left: 10px;width: 17px;">
    </el-form-item>
    <el-form-item label="账户状态:">
      <el-tag effect="dark" style="font-weight: 600;" type="success">正常</el-tag>
    </el-form-item>
    <template v-if="showPwdFlg">
      <el-divider><i class="el-icon-lock" /></el-divider>
      <el-form
        ref="formConfirm"
        :model="formConfirm"
        label-width="120px"
        :rules="rulesConfirm"
      >
        <el-form-item label="请输入原密码" prop="password">
          <el-input v-model="formConfirm.password" size="small" placeholder="请输入原密码" show-password clearable />
        </el-form-item>
        <span style="font-size: 13px;color: rgb(223, 18, 18);">若需要修改密码，可选择填写下方新密码及确认密码，不填即默认不修改原密码</span>
        <el-form-item label="新密码" prop="newPwd">
          <el-input v-model="formConfirm.newPwd" size="small" placeholder="请输入新密码" show-password clearable />
        </el-form-item>
        <el-form-item label="确认新密码" prop="confirmPwd">
          <el-input v-model="formConfirm.confirmPwd" size="small" placeholder="请确认新密码" show-password clearable />
        </el-form-item>
      </el-form>
    </template>
    <el-form-item label="" label-width="0px" style="float: right;">
      <el-button v-if="!editAble" type="primary" @click="edit">编 辑</el-button>
      <el-button v-if="editAble" @click="cancel">取 消</el-button>
      <el-button v-if="editAble" type="success" @click="save">保 存</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
import { utc2beijing } from '@/utils/methods.js'
import * as HTTP from '@/api/user'
export default {
  props: {},
  data() {
    const checkPwd = (rule, value, callback) => {
      if (value === '') {
        if (this.formConfirm.newPwd === '') {
          callback()
        }
        callback(new Error('请确认新密码'))
      } else {
        if (this.formConfirm.newPwd === '') {
          callback()
        } else {
          if (value === this.formConfirm.newPwd) {
            callback()
          }
          callback(new Error('两次输入的密码不一致'))
        }
      }
    }
    // 电话
    const validatePhone = (rule, value, callback) => {
      if (value !== '') {
        if (!/^1[3456789]\d{9}$/.test(value)) {
          callback(new Error('电话格式错误'))
        } else {
          callback()
        }
      }
      callback(new Error('电话不能为空'))
    }
    return {
      formRules: {},
      formConfirm: {
        password: '',
        newPwd: '',
        confirmPwd: ''
      },
      rules: {
        account: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        email: [{ required: true, type: 'email', message: '请输入正确的邮箱', trigger: 'blur' }],
        phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        sex: [{ required: true, message: '性别为必选', trigger: 'blur' }]
      },
      rulesConfirm: {
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        newPwd: [{ required: false, message: '请输入密码', trigger: 'blur' }],
        confirmPwd: [{ required: false, validator: checkPwd, trigger: 'blur' }]
      },
      editAble: false,
      editAble1: false,
      editAble2: false,
      modalFlg: false,
      showPwdFlg: false
    }
  },
  mounted() {
    this.formRules = JSON.parse(sessionStorage.getItem(location.host + '/coronal' + '/info'))
  },
  methods: {
    // 提交编辑后的数据
    save() {
      this.$refs['formConfirm'].validate((valid) => { // 校验密码是否填写
        if (valid) {
          this.$refs['formRules'].validate((valid) => { // 用户名、邮箱等选项是否填写
            if (valid) {
              const { id, account, email, phone, sex, last_login_time, authority } = this.formRules
              const params = { id, account, email, phone, sex, last_login_time, authority }
              params.last_login_time = utc2beijing(params.last_login_time)
              if (this.formConfirm.password === this.formConfirm.newPwd) {
                this.$message.warning('新旧密码不能相同')
                return
              }
              params.password = this.$md5(this.formConfirm.password)
              params.newPwd = [null, undefined, ''].includes(this.formConfirm.newPwd) ? '' : this.$md5(this.formConfirm.newPwd)
              console.log(params)
              HTTP.updateInfo(params).then((res) => {
                if (res.code === 200) {
                  this.$message({
                    message: res.msg,
                    type: 'success'
                  })
                  this.showPwdFlg = false
                  this.editAble = false
                  this.resetForm('formConfirm')
                  this.formRules.token = res.token
                  sessionStorage.setItem(location.host + '/coronal' + '/info', JSON.stringify(this.formRules))
                  this.$emit('updateUserInfo') // 更新左侧用户相关数据
                } else {
                  this.$message({
                    message: res.msg,
                    type: 'warning'
                  })
                }
              })
            }
          })
        }
      })
    },
    // 验证当前时间是否在免密码有效期内
    edit() {
      this.showPwdFlg = true
      this.editAble = true
    },
    // 取消编辑
    cancel() {
      this.resetForm('formRules')
      this.resetForm('formConfirm')
      this.formRules = JSON.parse(sessionStorage.getItem(location.host + '/coronal' + '/info'))
      this.showPwdFlg = false
      this.editAble = false
    },
    utc2beijing(date) {
      return utc2beijing(date)
    },
    // 清空rules规则
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>
<style lang="scss">
.profile{
  .el-select{
    width: 100%;
  }
}
</style>
