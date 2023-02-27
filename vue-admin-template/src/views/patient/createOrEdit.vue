<template>
  <div class="app-container">
    <el-form ref="form" class="descriptions-form" :model="form" :rules="$route.query.type === 'cure' ? rules : rules2" :disabled="$route.query.id && $route.query.type === 'detail'">
      <!-- 治愈信息 -->
      <el-descriptions v-if="$route.query.type === 'cure'" class="margin-top" title="治愈信息" :column="2" border>
        <el-descriptions-item label="出院时间">
          <el-form-item prop="leave_time">
            <el-date-picker
              v-model="form.leave_time"
              type="date"
              placeholder="请选择出院时间"
              value-format="yyyy-MM-dd"
              clearable
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="现状">
          <el-form-item prop="situation">
            <el-input v-model="form.situation" placeholder="请输入现状" />
          </el-form-item>
        </el-descriptions-item>
      </el-descriptions>
      <!-- 死亡信息 -->
      <el-descriptions v-else class="margin-top" title="死亡信息" :column="2" border>
        <el-descriptions-item label="死亡时间">
          <el-form-item prop="death_time">
            <el-date-picker
              v-model="form.death_time"
              type="date"
              placeholder="请选择死亡时间"
              value-format="yyyy-MM-dd"
              clearable
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="备注">
          <el-form-item prop="death_note">
            <el-input v-model="form.death_note" placeholder="请输入备注" />
          </el-form-item>
        </el-descriptions-item>
      </el-descriptions>
    </el-form>
    <div style="margin-top: 30px;text-align: center;">
      <el-button v-if="$route.query.id && $route.query.type === 'detail'" @click="onCancel">返回</el-button>
      <template v-else>
        <el-button type="primary" @click="onSubmit">提交</el-button>
        <el-button @click="onCancel">取消</el-button>
      </template>
    </div>
  </div>
</template>

<script>
import * as HTTP from '@/api/epidemic'
export default {
  data() {
    return {
      loading: false,
      form: {
        leave_time: '',
        situation: '',
        death_time: '',
        death_note: ''
      },
      rules: {
        leave_time: [{ required: true, message: '请选择出院时间', trigger: 'blur' }],
        situation: [{ required: true, message: '请输入现状', trigger: 'blur' }]
      },
      rules2: {
        death_time: [{ required: true, message: '请选择死亡时间', trigger: 'blur' }],
        death_note: [{ required: true, message: '请输入备注', trigger: 'blur' }]
      }
    }
  },
  mounted() {
  },
  methods: {
    // 确诊转治愈或死亡
    onSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.lading = true
          const params = {
            id: parseInt(this.$route.query.id),
            ...this.form,
            type: this.$route.query.type === 'cure' ? 0 : 1, // 0:转治愈 1：转死亡
            update_time: this.dateFormat(''),
            update_user: JSON.parse(sessionStorage.getItem(location.host + '/coronal' + '/info')).account
          }
          HTTP.toCureOrDeath(params).then(res => {
            if (res.code === 200) {
              this.$message.success(res.msg)
              this.onCancel()
            } else {
              this.$message.warning(res.msg)
            }
            this.lading = false
          })
        }
      })
    },
    onCancel() {
      this.resetForm('form') // 重置表单
      this.$router.push({ path: '/epidemic/patient' })
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

