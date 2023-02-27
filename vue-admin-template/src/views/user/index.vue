<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :inline="true" label-width="80px">
      <el-form-item label="用户名" prop="account">
        <el-input v-model="form.account" clearable placeholder="请输入用户名" />
      </el-form-item>
      <el-form-item label="邮箱" prop="email">
        <el-input v-model="form.email" clearable placeholder="请输入邮箱" />
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
        </el-select>
      </el-form-item>
      <el-form-item label="创建时间" prop="create_time">
        <el-date-picker
          v-model="form.create_time"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
          clearable
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-refresh" @click="onReset">重置</el-button>
        <el-button type="primary" @click="onSearch">查询</el-button>
        <el-button icon="el-icon-plus" type="primary" @click="onCreate">创建用户</el-button>
        <el-button icon="el-icon-download" type="success" @click="onExport">导出</el-button>
      </el-form-item>
    </el-form>
    <el-table
      v-loading="listLoading"
      :data="list"
      element-loading-text="Loading"
      border
      height="450"
      fit
      highlight-current-row
    >
      <el-table-column align="center" label="序号" width="55">
        <template slot-scope="scope">
          {{ scope.$index + 1 }}
        </template>
      </el-table-column>
      <el-table-column prop="account" label="用户名" align="center" />
      <el-table-column prop="email" label="邮箱" align="center" />
      <el-table-column prop="phone" label="电话" align="center" />
      <el-table-column label="性别" align="center">
        <template slot-scope="scope">
          <el-tag size="small" :type="scope.row.sex === 0 ? '' : 'success'">{{ scope.row.sex === 0 ? '男' : '女' }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="角色" align="center">
        <template slot-scope="scope">
          <el-tag size="small" :type="scope.row.roles === 0 ? 'success' : scope.row.roles === 1 ? '' : 'info'">
            {{ scope.row.roles === 0 ? '超级管理员' : scope.row.roles === 1 ? '管理员' : '普通用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column align="center" label="创建时间" width="200">
        <template slot-scope="scope">
          <span>{{ utc2beijing(scope.row.create_time, 2) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="handleEdit(scope.$index, scope.row)"
          >编辑</el-button>
          <el-button
            v-if="scope.row.account !== 'admin'"
            size="mini"
            type="danger"
            @click="handleDelete(scope.$index, scope.row)"
          >删除</el-button>
        </template>
      </el-table-column>
    </el-table>
    <common-dialog
      ref="form"
      :dialog-visible.sync="dialogVisible"
      :title="title"
      :wedding-list="weddingList"
      :type="type"
      :state="0"
      @createInfo="createInfo"
      @editInfo="editInfo"
    />
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
  </div>
</template>

<script>
import { getList, deleteUser, createUser, updateInfo } from '@/api/table'
import { utc2beijing } from '@/utils/methods'
import { parseTime } from '@/utils'
import CommonDialog from '@/components/CommonDialog'

export default {
  components: {
    CommonDialog
  },
  data() {
    return {
      list: null,
      listLoading: true,
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      dialogVisible: false,
      detailData: {},
      weddingList: [],
      title: '',
      type: 0, // 0:新建 1:编辑
      form: {
        account: '',
        email: '',
        create_time: [],
        sex: '',
        roles: ''
      }
    }
  },
  created() {
    this.onSearch()
  },
  methods: {
    // 条件查询
    onSearch(type = true) {
      this.listLoading = true
      const params = {
        pageNumber: type ? 1 : this.pageNumber,
        pageSize: this.pageSize,
        ...this.form
      }
      getList(params).then(res => {
        if (res.code === 200) {
          res.result.forEach((item, i) => {
            item.index = i + 1
            item.create_time = utc2beijing(item.create_time, 1)
          })
          this.list = res.result
          this.total = res.total
        } else {
          this.$message.warning(res.msg)
        }

        this.listLoading = false
      })
    },
    // 重置清空表单
    onReset() {
      this.form = {
        account: '',
        email: '',
        create_time: [],
        sex: '',
        roles: ''
      }
    },
    // 新建时打开弹窗
    onCreate() {
      this.title = '创建用户'
      this.type = 0
      this.dialogVisible = true
      this.$refs.form.form = {}
    },
    // 编辑数据
    handleEdit(index, row) {
      this.title = '编辑用户'
      this.type = 1
      this.dialogVisible = true
      row.password = '12345'
      console.log(row)
      this.$refs.form.form = { ...row }
    },
    // 导出当前页面的数据
    onExport() {
      this.loading = true
      const temp = JSON.parse(JSON.stringify(this.list))
      temp.forEach(item => {
        item.sex = item.sex === 0 ? '男' : '女'
        item.roles = item.roles === 0 ? '超级管理员' : item.roles === 1 ? '管理员' : '普通用户'
      })
      const fileName = '用户数据'
      import('@/vendor/Export2Excel').then(excel => {
        const tHeader = ['序号', '用户名', '邮箱', '电话', '性别', '角色', '创建时间']
        const filterVal = ['index', 'account', 'email', 'phone', 'sex', 'roles', 'create_time']
        const list = temp
        const data = this.formatJson(filterVal, list)
        excel.export_json_to_excel({
          header: tHeader,
          data,
          filename: fileName + new Date().getTime(),
          autoWidth: this.autoWidth,
          bookType: 'xlsx'
        })
        this.loading = false
      }).catch(() => {
        this.loading = false
      })
    },
    formatJson(filterVal, jsonData) {
      return jsonData.map(v => filterVal.map(j => {
        if (j === 'timestamp') {
          return parseTime(v[j])
        } else {
          return v[j]
        }
      }))
    },
    // 创建新数据
    createInfo(form) {
      const temp = JSON.parse(JSON.stringify(form))
      temp.password = this.$md5(form.password)
      temp.register_time = this.dateFormat('')
      createUser(temp).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.$refs.form.doClose()
          this.onSearch()
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    // 修改数据
    editInfo(form, type) {
      // type: 0-修改密码 1-不修改密码
      form.update_time = this.dateFormat('')
      form.type = type
      updateInfo(form).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.$refs.form.doClose()
          this.onSearch()
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    // 删除数据前的操作
    handleDelete(index, row) {
      this.$confirm('确定删除该数据?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.deleteDone(row)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消删除'
        })
      })
    },
    // 删除操作执行
    deleteDone(row) {
      deleteUser({ id: row.id, change_time: this.dateFormat('') }).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.onSearch()
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    handleSizeChange(val) {
      this.pageNumber = 1
      this.pageSize = val
      this.onSearch(false)
    },
    handleCurrentChange(val) {
      this.pageNumber = val
      this.onSearch(false)
    },
    // 时间格式化
    utc2beijing(date, type) {
      return utc2beijing(date, type)
    }
  }
}
</script>
