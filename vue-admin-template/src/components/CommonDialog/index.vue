<template>
  <el-dialog
    :title="title"
    :width="state === 1 ? '55%' : '30%'"
    :visible.sync="dialogVisible"
    :close-on-click-modal="false"
    :center="state === 1 ? true : false"
    :class="[ state === 1 ? 'special2' : 'special' ]"
    :show-close="false"
  >
    <el-form ref="form" :inline="state === 1 ? true : false" :model="form" label-width="110px" :rules="state === 0 ? rules : rules2">
      <template v-if="state === 0">
        <el-form-item label="用户名" prop="account">
          <el-input v-model="form.account" clearable placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item v-show="type === 0" label="密码" prop="password">
          <el-input v-model="form.password" placeholder="请输入密码" clearable show-password />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" clearable placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="form.phone" clearable placeholder="请输入电话" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="form.sex" clearable placeholder="请选择性别">
            <el-option :value="0" label="男">男</el-option>
            <el-option :value="1" label="女">女</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="角色" prop="roles">
          <el-select v-model="form.roles" clearable placeholder="请选择角色">
            <el-option :value="2" label="普通用户">普通用户</el-option>
            <el-option :value="1" label="管理员">管理员</el-option>
            <el-option :value="0" label="超级管理员">超级管理员</el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if="type === 1" label="修改密码">
          <el-switch v-model="checked" />
        </el-form-item>
        <template v-if="checked">
          <el-divider><i class="el-icon-lock" /></el-divider>
          <el-form
            ref="formConfirm"
            :model="formConfirm"
            label-width="100px"
            :rules="rulesConfirm"
          >
            <el-form-item label="原密码" prop="password">
              <el-input v-model="formConfirm.password" size="small" placeholder="请输入原密码" show-password clearable />
            </el-form-item>
            <el-form-item label="新密码" prop="newPwd">
              <el-input v-model="formConfirm.newPwd" size="small" placeholder="请输入新密码" show-password clearable />
            </el-form-item>
            <el-form-item label="确认新密码" prop="confirmPwd">
              <el-input v-model="formConfirm.confirmPwd" size="small" placeholder="请确认新密码" show-password clearable />
            </el-form-item>
          </el-form>
        </template>
      </template>
      <!-- 创建核酸检测记录 -->
      <template v-if="state === 1">
        <el-form-item label="姓名" prop="name">
          <el-input v-model="form.name" placeholder="请输入姓名" clearable />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-select v-model="form.sex" clearable placeholder="请选择性别">
            <el-option value="男" label="男">男</el-option>
            <el-option value="女" label="女">女</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="联系方式" prop="contact">
          <el-input v-model="form.contact" placeholder="请输入联系方式" clearable />
        </el-form-item>
        <el-form-item label="居住地址" prop="address">
          <el-input v-model="form.address" placeholder="请输入居住地址" clearable />
        </el-form-item>
        <el-form-item label="检测地点" prop="area">
          <el-input v-model="form.area" placeholder="请输入检测地点" clearable />
        </el-form-item>
        <el-form-item prop="check_time" label="检测时间">
          <el-date-picker
            v-model="form.check_time"
            type="date"
            placeholder="请选择检测时间"
            value-format="yyyy-MM-dd"
            clearable
          />
        </el-form-item>
        <el-form-item label="核酸检测" prop="acid">
          <el-select v-model="form.acid" clearable placeholder="请选择核酸检测结果">
            <el-option :value="0" label="阴性">阴性</el-option>
            <el-option :value="1" label="阳性">阳性</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="CT检测" prop="ct">
          <el-select v-model="form.ct" clearable placeholder="请选择CT检测结果">
            <el-option :value="0" label="正常">正常</el-option>
            <el-option :value="1" label="异常">异常</el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="上传检测报告" prop="upload">
          <el-upload
            ref="upload"
            :accept="accept"
            :action="uploadFilesUrl"
            :on-change="handleChange"
            :on-remove="handleRemove"
            :file-list="fileList"
            :auto-upload="false"
            drag
          >
            <i class="el-icon-upload" />
            <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
            <div slot="tip" class="el-upload__tip text-center">
              <span>仅允许导入jpg、png格式的图片。</span>
            </div>
          </el-upload>
        </el-form-item>
        <img v-show="![undefined, null, ''].includes(image)" class="import-img" :src="image">
      </template>
    </el-form>
    <div slot="footer" class="dialog-footer">
      <el-button @click="doClose">取 消</el-button>
      <el-button type="primary" @click="confirm">确 定</el-button>
    </div>
  </el-dialog>
</template>

<script>

export default {
  name: 'CommonDialog',
  props: {
    dialogVisible: {
      type: Boolean,
      required: false
    },
    title: { // 弹窗标题
      type: String,
      default: ''
    },
    type: { // 区分0：新增和1：编辑
      type: Number,
      default: 0
    },
    state: { // 区分 0：用户 1:核酸检测记录新增
      type: Number,
      default: 0
    },
    weddingList: { // 所有婚礼列表
      type: Array,
      default: () => []
    }
  },
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
      form: {},
      formConfirm: {
        password: '',
        newPwd: '',
        confirmPwd: ''
      },
      rules: {
        account: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        email: [
          { required: true, message: '请输入邮箱', trigger: 'blur' },
          { type: 'email', message: '请输入正确的邮箱地址', trigger: ['blur', 'change'] }],
        phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        sex: [{ required: true, message: '请选择性别', trigger: 'blur' }],
        roles: [{ required: true, message: '请选择角色', trigger: 'blur' }]
      },
      rules2: {
        name: [{ required: true, message: '请输入姓名', trigger: 'blur' }],
        sex: [{ required: true, message: '请选择性别', trigger: 'blur' }],
        contact: [{ required: true, message: '请输入联系方式', trigger: 'blur' }],
        address: [{ required: true, message: '请填写详细地址', trigger: 'blur' }],
        area: [{ required: true, message: '请输入检测地点', trigger: 'blur' }],
        check_time: [{ required: true, message: '请选择检测时间', trigger: 'blur' }],
        acid: [{ required: true, message: '请选择核酸检测结果', trigger: 'blur' }],
        ct: [{ required: true, message: '请选择CT检测结果', trigger: 'blur' }],
        upload: [{ required: false, message: '请上传检测报告图片', trigger: 'blur' }]
      },
      rulesConfirm: {
        password: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        newPwd: [{ required: true, message: '请输入密码', trigger: 'blur' }],
        confirmPwd: [{ required: true, validator: checkPwd, trigger: 'blur' }]
      },
      checked: false,
      uploadFilesUrl: process.env.VUE_APP_BASE_API + '/api/file/uploadFile', // 文件上传地址
      accept: '.jpg,.png,.JPG,.PNG',
      fileList: [],
      image: ''
    }
  },
  created() {},
  methods: {
    // 确认新建
    confirm() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          let params = {}
          if (this.type === 0) { // 新增
            params = {
              ...this.form,
              imageBase64: this.image
            }
            if (this.state === 1 && [undefined, null, ''].includes(this.image)) {
              this.$message.warning('请上传检测报告图片')
              return
            }
            this.$emit('createInfo', params)
          } else { // 编辑
            if (this.state === 1) { // 编辑检测信息
              if ([undefined, null, ''].includes(this.image)) {
                this.$message.warning('请上传检测报告图片')
                return
              }
              params = {
                ...this.form
              }
              params.report = this.image
              this.$emit('editInfo', params)
              return
            }
            if (this.checked) {
              this.$refs['formConfirm'].validate((valid) => {
                if (valid) {
                  params = {
                    ...this.form,
                    ...this.formConfirm
                  }
                  params.password = this.$md5(params.password)
                  params.newPwd = this.$md5(params.newPwd)
                  delete params.confirmPwd
                  this.$emit('editInfo', params, 0)
                }
              })
            } else {
              params = {
                ...this.form
              }
              this.$emit('editInfo', params, 1)
            }
          }
        }
      })
    },
    // 文件上传
    async handleChange(file) {
      const name = file.name.split('.')[file.name.split('.').length - 1] // 获取文件类型
      // 格式、限制校验
      if (!['JPG', 'PNG'].includes(name.toUpperCase())) {
        this.$message.warning('上传图片格式不支持')
        this.handleRemove(file)
        return
      }
      if (file.size / 1024 > 5 * 1024) {
        this.$message.warning('单个文件不能超过5M')
        this.handleRemove(file)
        return
      }
      if (this.fileList.length === 1 || this.fileList.length > 1) {
        this.$message.warning('最多支持上传一张图片')
        this.handleRemove(file)
        return
      }
      this.fileList.push(file)
      // 图片上传执行，上传前将图片转化为base64格式进行存储
      // 将图片转为base64格式
      const that = this
      const reader = new FileReader()
      reader.onloadend = function() {
        that.image = reader.result
        // that.confirm()
      }
      reader.readAsDataURL(this.fileList[0].raw)
    },
    // 已上传文件删除
    handleRemove(file) {
      this.image = ''
      this.fileList = this.fileList.filter(item => {
        return item.uid !== file.uid
      })
    },
    // 取消
    doClose() {
      if (this.checked) {
        this.resetForm('formConfirm')
        this.checked = false
      }
      this.fileList = []
      this.image = ''
      this.resetForm('form')
      this.$emit('update:dialogVisible')
    },
    // 移除校验结果、重置表单
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style scoped>
.svg-icon {
  width: 1em;
  height: 1em;
  vertical-align: -0.15em;
  fill: currentColor;
  overflow: hidden;
}

.svg-external-icon {
  background-color: currentColor;
  mask-size: cover!important;
  display: inline-block;
}
.import-img{
  position: absolute;
  bottom: 180px;
  right: 70px;
  width: 200px;
}
</style>
<style lang="scss">
.special {
  .el-select, .el-date-editor{
    width: 100%;
  }
}
.special2 {
  .el-input, .el-select, .el-date-editor{
    width: 100%;
    min-width: 250px;
  }
  .el-dialog {
    margin-top: 5vh !important;
    .el-dialog__body {
      padding: 25px 30px 0 30px;
    }
  }
}
</style>
