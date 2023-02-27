<template>
  <div style="padding: 0px 20px;">
    <el-form
      ref="form"
      class="descriptions-form"
      :model="form"
      :rules="$route.query.type === 'patient' ? rules : $route.query.type === 'patient-create' ? rules3 : rules2"
    >
      <!-- 新增密接者、 新增确诊患者-->
      <template v-if="$route.query.type === 'create' || $route.query.type === 'search' || $route.query.type === 'patient-create' || $route.query.type === 'patient-search'">
        <!-- 基本信息 -->
        <el-descriptions class="margin-top" title="基本信息" :column="2" border>
          <el-descriptions-item label="姓名">
            <el-form-item prop="name">
              <el-input v-model="form.name" placeholder="请输入姓名" :disabled="hideBaseFlg" />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="身份证号">
            <el-form-item prop="number">
              <el-input v-model="form.number" placeholder="请输入身份证号" :disabled="hideBaseFlg" />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="年龄">
            <el-form-item prop="age">
              <el-input v-model="form.age" placeholder="请输入年龄" :disabled="hideBaseFlg" />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="性别">
            <el-form-item prop="sex">
              <el-select v-model="form.sex" clearable placeholder="请选择性别" :disabled="hideBaseFlg">
                <el-option :value="0" label="男">男</el-option>
                <el-option :value="1" label="女">女</el-option>
              </el-select>
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="地址">
            <el-form-item prop="address">
              <el-input v-model="form.address" placeholder="请输入地址" :disabled="hideBaseFlg" />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="电话">
            <el-form-item prop="phone">
              <el-input v-model="form.phone" placeholder="请输入电话" :disabled="hideBaseFlg" />
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>
        <!-- 隔离信息 -->
        <div v-if="$route.query.type === 'create' || $route.query.type === 'search'" style="position: relative;">
          <el-descriptions class="margin-top" title="隔离信息" :column="2" border>
            <el-descriptions-item label="接触来源">
              <el-form-item prop="source">
                <el-input v-model="form.source" placeholder="请输入接触来源" :disabled="control" />
              </el-form-item>
            </el-descriptions-item>
            <el-descriptions-item label="隔离开始时间">
              <el-form-item prop="start_time">
                <el-date-picker
                  v-model="form.start_time"
                  type="date"
                  placeholder="请选择隔离开始时间"
                  value-format="yyyy-MM-dd"
                  :disabled="control"
                  clearable
                />
              </el-form-item>
            </el-descriptions-item>
            <el-descriptions-item label="隔离地址">
              <el-form-item prop="isolate_address">
                <el-input v-model="form.isolate_address" placeholder="请输入隔离地址" :disabled="control" />
              </el-form-item>
            </el-descriptions-item>
          </el-descriptions>
          <!--编辑密接者数据 -->
          <template v-if="$route.query.type !== 'create'">
            <el-button v-if="control" type="primary" size="mini" class="add-btn" style="top: 0;" @click="onEdit">编辑</el-button>
            <div v-else class="add-btn" style="top: 0;">
              <el-button type="success" size="mini" @click="onSave">保存</el-button>
              <el-button size="mini" @click="onCanceled">取消</el-button>
            </div>
          </template>
        </div>
      </template>
      <!-- 转确诊 - 病患信息 -->
      <div v-if="$route.query.type === 'patient' || $route.query.type === 'patient-create' || $route.query.type === 'patient-search'" style="position: relative;">
        <el-descriptions class="margin-top" title="病患信息" :column="2" border>
          <el-descriptions-item label="感染源">
            <el-form-item prop="infection">
              <el-input v-model="form.infection" placeholder="请输入感染源" :disabled="control" />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="住院时间">
            <el-form-item prop="hospital_time">
              <el-date-picker
                v-model="form.hospital_time"
                type="date"
                :disabled="control"
                placeholder="请选择住院时间"
                value-format="yyyy-MM-dd"
                clearable
              />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="症状">
            <el-form-item prop="symptom">
              <el-input v-model="form.symptom" placeholder="请描述症状" :disabled="control" />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="诊治医院">
            <el-form-item prop="hospital">
              <el-input v-model="form.hospital" placeholder="请输入诊治医院" :disabled="control" />
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="是否重症">
            <el-form-item prop="is_weight">
              <el-select v-model="form.is_weight" clearable placeholder="请选择是否重症" :disabled="control">
                <el-option :value="0" label="是">是</el-option>
                <el-option :value="1" label="否">否</el-option>
              </el-select>
            </el-form-item>
          </el-descriptions-item>
          <el-descriptions-item label="备注">
            <el-form-item prop="remarks">
              <el-input v-model="form.remarks" placeholder="请输入备注" :disabled="control" />
            </el-form-item>
          </el-descriptions-item>
        </el-descriptions>
        <!--编辑病患数据 -->
        <template v-if="$route.query.type === 'patient-search'">
          <el-button v-if="control" type="primary" size="mini" class="add-btn" style="top: 0;" @click="onEdit">编辑</el-button>
          <div v-else class="add-btn" style="top: 0;">
            <el-button type="success" size="mini" @click="onSave">保存</el-button>
            <el-button size="mini" @click="onCanceled">取消</el-button>
          </div>
        </template>
      </div>
    </el-form>
    <div style="margin-top: 30px;text-align: center;">
      <el-button v-if="$route.query.type && $route.query.type.indexOf('search') !== -1" @click="onCancel">返回</el-button>
      <template v-else>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button @click="onCancel">取消</el-button>
      </template>
    </div>
  </div>
</template>

<script>
import * as HTTP from '@/api/epidemic'
import { utc2beijing } from '@/utils/methods'
export default {
  components: {},
  data() {
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
    // 身份证号
    var checkNumber = (rule, value, callback) => {
      if (!value) {
        return callback(new Error('请输入身份证号码'))
      }
      var reg = /^[1-9]\d{7}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}$|^[1-9]\d{5}[1-9]\d{3}((0\d)|(1[0-2]))(([0|1|2]\d)|3[0-1])\d{3}([0-9]|X|x)$/
      if (reg.test(value)) {
        callback()
      } else {
        callback(new Error('请输入正确的身份证号码'))
      }
    }
    return {
      loading: false,
      form: {
        name: '',
        number: '',
        age: '',
        sex: '',
        address: '',
        phone: '',
        source: '',
        start_time: '',
        isolate_address: '',
        infection: '',
        hospital_time: '',
        symptom: '',
        hospital: '',
        is_weight: '',
        remarks: ''
      },
      rules: {
        infection: [{ required: true, message: '请输入感染源', trigger: 'blur' }],
        hospital_time: [{ required: true, message: '请选择住院时间', trigger: 'blur' }],
        hospital: [{ required: true, message: '请输入诊治医院', trigger: 'blur' }],
        symptom: [{ required: true, message: '请输入症状', trigger: 'blur' }],
        remarks: [{ required: true, message: '请选输入备注', trigger: 'blur' }],
        is_weight: [{ required: true, message: '请选择是否重症', trigger: 'blur' }]
      },
      rules2: {
        name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        number: [{ required: true, validator: checkNumber, trigger: 'blur' }],
        age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
        phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        sex: [{ required: true, message: '请选择性别', trigger: 'blur' }],
        address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
        source: [{ required: true, message: '请选择接触来源', trigger: 'blur' }],
        start_time: [{ required: true, message: '请选择隔离开始时间', trigger: 'blur' }],
        isolate_address: [{ required: true, message: '请输入隔离地址', trigger: 'blur' }]
      },
      rules3: {
        name: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
        number: [{ required: true, validator: checkNumber, trigger: 'blur' }],
        age: [{ required: true, message: '请输入年龄', trigger: 'blur' }],
        phone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
        sex: [{ required: true, message: '请选择性别', trigger: 'blur' }],
        address: [{ required: true, message: '请输入地址', trigger: 'blur' }],
        infection: [{ required: true, message: '请输入感染源', trigger: 'blur' }],
        hospital_time: [{ required: true, message: '请选择住院时间', trigger: 'blur' }],
        hospital: [{ required: true, message: '请输入诊治医院', trigger: 'blur' }],
        symptom: [{ required: true, message: '请输入症状', trigger: 'blur' }],
        remarks: [{ required: true, message: '请选输入备注', trigger: 'blur' }],
        is_weight: [{ required: true, message: '请选择是否重症', trigger: 'blur' }]
      },
      title: '',
      type: 0, // 0:新建 1:编辑
      tableData: [], // 存储检测历史数据
      controlFlg: true
    }
  },
  computed: {
    hideBaseFlg() {
      // 控制基本信息不能编辑
      return this.$route.query.type && this.$route.query.type.indexOf('search') !== -1
    },
    control() {
      // 控制部分数据可编辑
      return this.$route.query.type && this.$route.query.type.indexOf('search') !== -1 && this.controlFlg
    }
  },
  mounted() {
    if (this.$route.query && this.$route.query.type.indexOf('search') !== -1) { // 查看详情
      this.getInfo()
    }
  },
  methods: {
    // 查看详情
    getInfo() {
      HTTP.getTraceInfo({ id: this.$route.query.id }).then(res => {
        if (res.code === 200) {
          res.result.hospital_time = utc2beijing(res.result.hospital_time, 2)
          res.result.start_time = utc2beijing(res.result.start_time, 2)
          // 暂存数据
          sessionStorage.setItem(location.host + '/coronal' + '/epic-info', JSON.stringify(res.result))
          this.form = res.result
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    // 提交
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.lading = true
          switch (this.$route.query.type) {
            case 'create':
              // 新增密接者
              this.createTraceInfo()
              break
            case 'patient':
              // 转确诊
              this.toPatiented()
              break
            case 'patient-create':
              // 新增确诊患者
              this.createPatientInfo()
              break
          }
        }
      })
    },
    // 新建密接者
    createTraceInfo() {
      const params = {
        ...this.form,
        create_time: this.dateFormat(''),
        create_user: JSON.parse(sessionStorage.getItem(location.host + '/coronal' + '/info')).account
      }
      HTTP.createUser(params).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.onCancel()
        } else {
          this.$message.warning(res.msg)
        }
        this.lading = false
      })
    },
    // 新建确诊者
    createPatientInfo() {
      const params = {
        ...this.form,
        create_time: this.dateFormat(''),
        create_user: JSON.parse(sessionStorage.getItem(location.host + '/coronal' + '/info')).account
      }
      HTTP.createPatientUser(params).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.onCancel()
        } else {
          this.$message.warning(res.msg)
        }
        this.lading = false
      })
    },
    // 密接转确诊
    toPatiented() {
      const params = {
        id: this.$route.query.id,
        ...this.form,
        update_time: this.dateFormat(''),
        update_user: JSON.parse(sessionStorage.getItem(location.host + '/coronal' + '/info')).account
      }
      HTTP.toPatiented(params).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.onCancel()
        } else {
          this.$message.warning(res.msg)
        }
        this.lading = false
      })
    },
    // 编辑病患数据
    onEdit() {
      this.controlFlg = false
    },
    // 保存已编辑的病患数据
    onSave() {
      const params = {
        ...this.form,
        id: parseInt(this.$route.query.id),
        type: this.$route.query.type === 'search' ? 0 : 1, // 0：修改密接者隔离信息 1：修改确诊者病患信息
        update_time: this.dateFormat(''),
        update_user: JSON.parse(sessionStorage.getItem(location.host + '/coronal' + '/info')).account
      }
      HTTP.updateInfo(params).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.getInfo()
          this.controlFlg = true
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    onCancel() {
      console.log(this.form)
      this.resetForm('form') // 重置表单
      this.$router.go(-1)
    },
    // 取消编辑
    onCanceled() {
      const temp = JSON.parse(sessionStorage.getItem(location.host + '/coronal' + '/epic-info')) // 取用原始数据，替换修改但未保存的数据
      this.form = { ...temp }
      this.controlFlg = true
    },
    // 时间格式化
    utc2beijing(date, type) {
      return utc2beijing(date, type)
    },
    // 移除校验结果、重置表单
    resetForm(formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>

<style scoped>
.line{
  text-align: center;
}
.history{
  padding: 20px 5px;
  position: relative;
}
.title{
  font-weight: 700;
  line-height: 30px;
}
.add-btn{
  position: absolute;
  right: 0;
  top: 20px;
}
</style>
<style lang="scss">
.descriptions-form{
  .el-form-item{
    margin-bottom: 10px;
  }
  .el-select, .el-date-editor{
    width: 100%;
  }
  .el-descriptions, +.el-descriptions{
    margin-top: 20px;
  }
}
</style>

