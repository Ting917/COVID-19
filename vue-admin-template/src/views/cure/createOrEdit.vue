<template>
  <div style="padding: 0px 20px;">
    <el-form
      ref="form"
      class="descriptions-form"
      :model="form"
      :disabled="true"
    >
      <!-- 新增密接者、 新增确诊患者-->
      <!-- 基本信息 -->
      <el-descriptions class="margin-top" title="基本信息" :column="2" border>
        <el-descriptions-item label="姓名">
          <el-form-item prop="name">
            <el-input v-model="form.name" placeholder="请输入姓名" />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="身份证号">
          <el-form-item prop="number">
            <el-input v-model="form.number" placeholder="请输入身份证号" />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="年龄">
          <el-form-item prop="age">
            <el-input v-model="form.age" placeholder="请输入年龄" />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="性别">
          <el-form-item prop="sex">
            <el-select v-model="form.sex" clearable placeholder="请选择性别">
              <el-option :value="0" label="男">男</el-option>
              <el-option :value="1" label="女">女</el-option>
            </el-select>
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="地址">
          <el-form-item prop="address">
            <el-input v-model="form.address" placeholder="请输入地址" />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="电话">
          <el-form-item prop="phone">
            <el-input
              v-model="form.phone"
              placeholder="请输入电话"
            />
          </el-form-item>
        </el-descriptions-item>
      </el-descriptions>
      <!-- 隔离信息 -->
      <el-descriptions class="margin-top" title="隔离信息" :column="2" border>
        <el-descriptions-item label="接触来源">
          <el-form-item prop="source">
            <el-input v-model="form.source" placeholder="请输入接触来源" />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="隔离开始时间">
          <el-form-item prop="start_time">
            <el-date-picker
              v-model="form.start_time"
              type="date"
              placeholder="请选择隔离开始时间"
              value-format="yyyy-MM-dd"
              clearable
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="隔离地址">
          <el-form-item prop="isolate_address">
            <el-input v-model="form.isolate_address" placeholder="请输入隔离地址" />
          </el-form-item>
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions class="margin-top" title="病患信息" :column="2" border>
        <el-descriptions-item label="感染源">
          <el-form-item prop="infection">
            <el-input v-model="form.infection" placeholder="请输入感染源" />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="住院时间">
          <el-form-item prop="hospital_time">
            <el-date-picker
              v-model="form.hospital_time"
              type="date"
              placeholder="请选择住院时间"
              value-format="yyyy-MM-dd"
              clearable
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="症状">
          <el-form-item prop="symptom">
            <el-input v-model="form.symptom" placeholder="请描述症状" />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="诊治医院">
          <el-form-item prop="hospital">
            <el-input v-model="form.hospital" placeholder="请输入诊治医院" />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="是否重症">
          <el-form-item prop="is_weight">
            <el-select v-model="form.is_weight" clearable placeholder="请选择是否重症">
              <el-option :value="0" label="是">是</el-option>
              <el-option :value="1" label="否">否</el-option>
            </el-select>
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="备注">
          <el-form-item prop="remarks">
            <el-input v-model="form.remarks" placeholder="请输入备注" />
          </el-form-item>
        </el-descriptions-item>
      </el-descriptions>
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
      <el-button @click="onCancel">返回</el-button>
    </div>
  </div>
</template>

<script>
import * as HTTP from '@/api/epidemic'
import { utc2beijing } from '@/utils/methods'
export default {
  data() {
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
        remarks: '',
        leave_time: '',
        situation: '',
        death_time: '',
        death_note: ''
      },
      tableData: [] // 存储检测历史数据
    }
  },
  mounted() {
    this.getInfo() // 获取基本信息
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
    // 时间格式化
    utc2beijing(date, type) {
      return utc2beijing(date, type)
    },
    onCancel() {
      this.$router.go(-1)
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

