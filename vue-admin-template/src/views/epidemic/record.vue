<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :inline="true">
      <el-form-item>
        <el-input v-model="form.name" clearable placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item>
        <el-select v-model="form.sex" clearable placeholder="请选择性别">
          <el-option value="男" label="男">男</el-option>
          <el-option value="女" label="女">女</el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="form.check_time"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
          clearable
          range-separator="至"
          start-placeholder="检测开始日期"
          end-placeholder="检测结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" type="primary" @click="getHistory">查询</el-button>
        <el-button icon="el-icon-plus" type="primary" @click="onAddHistory">创建检测单</el-button>
      </el-form-item>
    </el-form>
    <el-table
    v-loading="listLoading"
        :data="tableData"
        style="width: 100%"
      >
        <el-table-column prop="name" label="姓名" align="center" />
        <el-table-column label="性别" align="center">
          <template slot-scope="scope">
            <el-tag size="small" :type="scope.row.sex === '男' ? '' : 'success'">{{ scope.row.sex }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="contact" label="联系方式" align="center" width="170" />
        <el-table-column prop="address" label="居住地址" align="center" show-overflow-tooltip />
        <el-table-column prop="area" label="检测地点" align="center" show-overflow-tooltip />
        <el-table-column align="center" label="检测时间">
          <template slot-scope="scope">
            <span>{{ utc2beijing(scope.row.check_time, 2) }}</span>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="acid" label="核酸检测">
          <template slot-scope="scope">
            <el-tag size="small" :type="scope.row.acid === 0 ? 'success' : 'danger'">{{ scope.row.acid === 0 ? '阴性' : '阳性' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column align="center" prop="ct" label="CT检测">
          <template slot-scope="scope">
            <el-tag size="small" :type="scope.row.ct === 0 ? 'success' : 'danger'">{{ scope.row.ct === 0 ? '正常' : '异常' }}</el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" align="center" width="200">
          <template slot-scope="scope">
            <el-button
              size="mini"
              type="success"
              @click="toDetails(scope.$index, scope.row)"
            >编辑</el-button>
            <el-button
              size="mini"
              type="danger"
              @click="toDelete(scope.$index, scope.row)"
            >删除</el-button>
          </template>
        </el-table-column>
      </el-table>
    <!-- 分页 -->
    <div class="pagination" style="text-align: center;margin-top: 10px;">
      <el-pagination
        v-show="total > 0"
        :current-page="pageNumber"
        :page-sizes="[10, 20, 50, 100]"
        :page-size="pageSize"
        layout="total, sizes, prev, pager, next, jumper"
        :total="total"
        background
        @size-change="handleSizeChange"
        @current-change="handleCurrentChange"
      />
    </div>
    <!-- 创建检测记录弹窗 -->
    <common-dialog
      ref="formRules"
      :dialog-visible.sync="dialogVisible"
      :title="title"
      :type="type"
      :state="1"
      @createInfo="createInfo"
      @editInfo="editInfo"
    />
  </div>
</template>

<script>
import * as HTTP from '@/api/epidemic'
import { utc2beijing } from '@/utils/methods'
import CommonDialog from '@/components/CommonDialog'

export default {
  components: {
    CommonDialog
  },
  data() {
    return {
      tableData: [],
      listLoading: true,
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      type: 0, // 0:新建 1:编辑
      title: '',
      form: {
        name: '',
        sex: '',
        check_time: []
      },
      dialogVisible: false
    }
  },
  created() {
    this.getHistory() // 获取检测记录
  },
  methods: {
    // 获取检测记录
    getHistory() {
      this.listLoading = true
      HTTP.getCheckInfo({ ...this.form }).then(res => {
        if (res.code === 200) {
          this.tableData = res.result
          this.total = res.total
        } else {
          this.$message.warning(res.msg)
        }
        this.listLoading = false
      })
    },
    // 查看详情数据
    toDetails(index, row) {
      this.title = '编辑检测记录'
      this.type = 1
      this.dialogVisible = true
      this.$refs.formRules.form = { ...row }
      this.$refs.formRules.image = JSON.parse(JSON.stringify(row.report))
    },
    // 修改数据
    editInfo(form) {
      form.check_time = utc2beijing(form.check_time, 2)
      form.update_time = this.dateFormat(''),
      form.update_user = JSON.parse(sessionStorage.getItem(location.host + '/coronal' + '/info')).account
      console.log(form)
      HTTP.updateCheckInfo(form).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.$refs.formRules.doClose()
          this.getHistory()
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    // 删除前提示
    toDelete(index, row) {
      this.$confirm('确认删除该条检测信息?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteOne(row)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    },
    // 删除数据
    deleteOne(row) {
      const params = {
        id: row.id,
        update_time: this.dateFormat(''),
        update_user: JSON.parse(sessionStorage.getItem(location.host + '/coronal' + '/info')).account
      }
      HTTP.deleteCheckOne(params).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.getHistory()
        } else {
          this.$message.warning(res.msg)
        }
        this.lading = false
      })
    },
    // 添加检测记录
    onAddHistory() {
      this.title = '新建检测记录'
      this.type = 0
      this.dialogVisible = true
    },
    // 创建检测新数据
    createInfo(form) {
      form.create_time = this.dateFormat('')
      form.create_user = JSON.parse(sessionStorage.getItem(location.host + '/coronal' + '/info')).account
      HTTP.createCheck(form).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.$refs.formRules.doClose()
          this.getHistory()
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    handleSizeChange(val) {
      this.pageNumber = 1
      this.pageSize = val
      this.getHistory(false)
    },
    handleCurrentChange(val) {
      this.pageNumber = val
      this.getHistory(false)
    },
    // 时间格式化
    utc2beijing(date, type) {
      return utc2beijing(date, type)
    }
  }
}
</script>
