<template>
  <div style="padding: 0px 20px">
    <el-form ref="form" class="descriptions-form" :model="form" :rules="rules">
      <!-- 接种人信息 -->
      <el-descriptions class="margin-top" title="接种人信息" :column="3" border>
        <el-descriptions-item label="接种人姓名">
          <el-form-item prop="name">
            <el-input
              v-model="form.name"
              placeholder="请输入姓名"
              :disabled="control"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="接种人所在区域">
          <el-form-item prop="area">
            <el-input
              v-model="form.area"
              placeholder="请输入接种人所在区域"
              :disabled="control"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="接种人身体状况">
          <el-form-item prop="conditions">
            <el-select
              v-model="form.conditions"
              clearable
              placeholder="请选择身体状况"
              :disabled="control"
            >
              <el-option value="健康" label="健康">健康</el-option>
              <el-option value="亚健康" label="亚健康">亚健康</el-option>
            </el-select>
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="接种人性别">
          <el-form-item prop="sex">
            <el-select
              v-model="form.sex"
              clearable
              placeholder="请选择性别"
              :disabled="control"
            >
              <el-option value="男" label="男">男</el-option>
              <el-option value="女" label="女">女</el-option>
            </el-select>
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="接种人详细地址">
          <el-form-item prop="address">
            <el-input
              v-model="form.address"
              placeholder="请输入地址"
              :disabled="control"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="是否有过敏史">
          <el-form-item prop="allergy">
            <el-select
              v-model="form.allergy"
              clearable
              placeholder="请选择"
              :disabled="control"
            >
              <el-option value="是" label="是">是</el-option>
              <el-option value="否" label="否">否</el-option>
            </el-select>
          </el-form-item>
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions class="margin-top" title="接种点信息" :column="3" border>
        <el-descriptions-item label="接种点名称">
          <el-form-item prop="inoculation_site">
            <el-input
              v-model="form.inoculation_site"
              placeholder="请输入接种点名称"
              :disabled="control"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="所在区域">
          <el-form-item prop="inoculation_area">
            <el-input
              v-model="form.inoculation_area"
              placeholder="请输入所在区域"
              :disabled="control"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="详细地址">
          <el-form-item prop="inoculation_address">
            <el-input
              v-model="form.inoculation_address"
              placeholder="请输入详细地址"
              :disabled="control"
            />
          </el-form-item>
        </el-descriptions-item>
      </el-descriptions>
      <el-descriptions class="margin-top" title="疫苗信息" :column="3" border>
        <el-descriptions-item label="疫苗名称">
          <el-form-item prop="vaccines_name">
            <el-input
              v-model="form.vaccines_name"
              placeholder="请输入疫苗名称"
              :disabled="control"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="疫苗编号">
          <el-form-item prop="vaccines_number">
            <el-input
              v-model="form.vaccines_number"
              placeholder="请输入疫苗编号"
              :disabled="control"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="疫苗类别">
          <el-form-item prop="vaccines_type">
            <el-select
              v-model="form.vaccines_type"
              clearable
              placeholder="请选择疫苗类别"
              :disabled="control"
            >
              <el-option value="流感疫苗" label="流感疫苗">流感疫苗</el-option>
              <el-option value="新冠疫苗" label="新冠疫苗">新冠疫苗</el-option>
            </el-select>
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="注射总针数">
          <el-form-item prop="number">
            <el-input
              v-model="form.number"
              placeholder="请输入注射总针数"
              :disabled="control"
            />
          </el-form-item>
        </el-descriptions-item>
        <el-descriptions-item label="疫苗等级">
          <el-form-item prop="vaccines_level">
            <el-select
              v-model="form.vaccines_level"
              clearable
              placeholder="请选择疫苗等级"
              :disabled="control"
            >
              <el-option value="一级" label="一级">一级</el-option>
              <el-option value="二级" label="二级">二级</el-option>
              <el-option value="三级" label="三级">三级</el-option>
            </el-select>
          </el-form-item>
        </el-descriptions-item>
      </el-descriptions>
    </el-form>
    <div style="margin-top: 30px; text-align: center">
      <el-button
        v-if="$route.query.type && $route.query.type.indexOf('search') !== -1"
        @click="onCancel"
        >返回</el-button
      >
      <template v-else>
        <el-button @click="onCancel">取消</el-button>
        <el-button
          v-if="$route.query.type && $route.query.type.indexOf('create') !== -1"
          type="primary"
          @click="onSubmit"
          >提交记录</el-button
        >
        <el-button v-else type="primary" @click="onSubmit">修改预约</el-button>
      </template>
    </div>
    <!-- 创建检测记录弹窗 -->
    <common-dialog
      ref="formRules"
      :dialog-visible.sync="dialogVisible"
      :title="title"
      :type="type"
      :state="1"
      @createInfo="createInfo"
    />
  </div>
</template>

<script>
import * as HTTP from "@/api/epidemic";
import CommonDialog from "@/components/CommonDialog";
import { utc2beijing } from "@/utils/methods";
export default {
  components: {
    CommonDialog,
  },
  data() {
    return {
      loading: false,
      form: {
        name: "",
        area: "",
        conditions: "",
        sex: "",
        address: "",
        allergy: "",
        inoculation_site: "",
        inoculation_area: "",
        inoculation_address: "",
        vaccines_name: "",
        vaccines_number: "",
        vaccines_type: "",
        number: "",
        vaccines_level: "",
      },
      rules: {
        name: [
          { required: true, message: "请输入接种人姓名", trigger: "blur" },
        ],
        area: [
          { required: true, message: "请输入接种人所在区域", trigger: "blur" },
        ],
        conditions: [
          { required: true, message: "请输入接种人身体状况", trigger: "blur" },
        ],
        sex: [{ required: true, message: "请选择接种人性别", trigger: "blur" }],
        address: [
          { required: true, message: "请输入接种人详细地址", trigger: "blur" },
        ],
        allergy: [
          {
            required: true,
            message: "请选择接种人是否有过敏史",
            trigger: "blur",
          },
        ],
        inoculation_site: [
          { required: true, message: "请输入接种点名称", trigger: "blur" },
        ],
        inoculation_area: [
          { required: true, message: "请输入接种点所在区域", trigger: "blur" },
        ],
        inoculation_address: [
          { required: true, message: "请输入接种点详细地址", trigger: "blur" },
        ],
        vaccines_name: [
          { required: true, message: "请输入疫苗名称", trigger: "blur" },
        ],
        vaccines_number: [
          { required: true, message: "请输入疫苗编号", trigger: "blur" },
        ],
        vaccines_type: [
          { required: true, message: "请选择疫苗类别", trigger: "blur" },
        ],
        number: [
          { required: true, message: "请输入注射总针数", trigger: "blur" },
        ],
        vaccines_level: [
          { required: true, message: "请选择疫苗等级", trigger: "blur" },
        ],
        // appointment_time: [{ required: true, message: '请选择预约日期', trigger: 'blur' }],
        // appointment: [{ required: true, message: '请选择预约时间', trigger: 'blur' }],
        // appointment_number: [{ required: true, message: '请选择预约疫苗针数', trigger: 'blur' }]
      },
      dialogVisible: false,
      title: "",
      type: 0, // 0:新建 1:编辑
      tableData: [], // 存储检测历史数据
      controlFlg: true,
    };
  },
  computed: {
    control() {
      // 控制数据不可编辑
      return (
        this.$route.query.type &&
        this.$route.query.type.indexOf("search") !== -1
      );
    },
  },
  mounted() {
    if (this.$route.query && this.$route.query.type.indexOf("create") === -1) {
      // 查看详情或编辑
      this.getInfo();
    }
  },
  methods: {
    // 查看详情
    getInfo() {
      HTTP.getAppointmentInfoOne({ id: this.$route.query.id }).then((res) => {
        if (res.code === 200) {
          res.result.appointment_time = utc2beijing(
            res.result.appointment_time,
            2
          );
          // 暂存数据
          sessionStorage.setItem(
            location.host + "/coronal" + "/epic-info",
            JSON.stringify(res.result)
          );
          this.form = res.result;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 添加检测记录
    onAddHistory() {
      this.title = "新建检测记录";
      this.type = 0;
      this.dialogVisible = true;
    },
    // 创建或修改预约信息
    onSubmit() {
      this.$refs["form"].validate((valid) => {
        if (valid) {
          this.lading = true;
          switch (this.$route.query.type) {
            case "create":
              // 新增预约信息
              this.createAppointmentInfo();
              break;
            case "edit":
              // 修改预约信息
              this.editAppointmentInfo();
              break;
            case "search":
              break;
          }
        }
      });
    },
    // 新增预约信息
    createAppointmentInfo() {
      const params = {
        ...this.form,
        create_time: this.dateFormat(""),
        create_user: JSON.parse(
          sessionStorage.getItem(location.host + "/coronal" + "/info")
        ).account,
      };
      HTTP.createAppointmentInfo(params).then((res) => {
        if (res.code === 200) {
          this.$message.success(res.msg);
          this.onCancel();
        } else {
          this.$message.warning(res.msg);
        }
        this.lading = false;
      });
    },
    // 新建确诊者
    createPatientInfo() {
      const params = {
        ...this.form,
        create_time: this.dateFormat(""),
        create_user: JSON.parse(
          sessionStorage.getItem(location.host + "/coronal" + "/info")
        ).account,
      };
      HTTP.createPatientUser(params).then((res) => {
        if (res.code === 200) {
          this.$message.success(res.msg);
          this.onCancel();
        } else {
          this.$message.warning(res.msg);
        }
        this.lading = false;
      });
    },
    // 修改预约信息
    editAppointmentInfo() {
      const params = {
        id: this.$route.query.id,
        ...this.form,
        update_time: this.dateFormat(""),
        update_user: JSON.parse(
          sessionStorage.getItem(location.host + "/coronal" + "/info")
        ).account,
      };
      params.appointment_time = utc2beijing(params.appointment_time, 2);
      HTTP.editAppointmentInfo(params).then((res) => {
        if (res.code === 200) {
          this.$message.success(res.msg);
          this.onCancel();
        } else {
          this.$message.warning(res.msg);
        }
        this.lading = false;
      });
    },
    // 编辑病患数据
    onEdit() {
      this.controlFlg = false;
    },
    // 创建检测新数据
    createInfo(form) {
      form.trace_id = parseInt(this.$route.query.id);
      form.create_time = this.dateFormat("");
      form.create_user = JSON.parse(
        sessionStorage.getItem(location.host + "/coronal" + "/info")
      ).account;
      HTTP.createCheck(form).then((res) => {
        if (res.code === 200) {
          this.$message.success(res.msg);
          this.$refs.formRules.doClose();
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    // 保存已编辑的病患数据
    onSave() {
      const params = {
        ...this.form,
        id: parseInt(this.$route.query.id),
        type: this.$route.query.type === "search" ? 0 : 1, // 0：修改密接者隔离信息 1：修改确诊者病患信息
        update_time: this.dateFormat(""),
        update_user: JSON.parse(
          sessionStorage.getItem(location.host + "/coronal" + "/info")
        ).account,
      };
      HTTP.updateInfo(params).then((res) => {
        if (res.code === 200) {
          this.$message.success(res.msg);
          this.getInfo();
          this.controlFlg = true;
        } else {
          this.$message.warning(res.msg);
        }
      });
    },
    onCancel() {
      console.log(this.form);
      this.resetForm("form"); // 重置表单
      this.$router.go(-1);
    },
    // 取消编辑
    onCanceled() {
      const temp = JSON.parse(
        sessionStorage.getItem(location.host + "/coronal" + "/epic-info")
      ); // 取用原始数据，替换修改但未保存的数据
      this.form = { ...temp };
      this.controlFlg = true;
    },
    // 时间格式化
    utc2beijing(date, type) {
      return utc2beijing(date, type);
    },
    // 移除校验结果、重置表单
    resetForm(formName) {
      this.$refs[formName].resetFields();
    },
  },
};
</script>

<style scoped>
.line {
  text-align: center;
}
.history {
  padding: 20px 5px;
  position: relative;
}
.title {
  font-weight: 700;
  line-height: 30px;
}
.add-btn {
  position: absolute;
  right: 0;
  top: 20px;
}
</style>
<style lang="scss">
.descriptions-form {
  .el-form-item {
    margin-bottom: 10px;
  }
  .el-select,
  .el-date-editor {
    width: 100%;
  }
  .el-descriptions,
  + .el-descriptions {
    margin-top: 20px;
  }
}
</style>

