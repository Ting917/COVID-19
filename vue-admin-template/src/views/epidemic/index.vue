<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :inline="true">
      <el-form-item>
        <el-input v-model="form.name" clearable placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item>
        <el-select v-model="form.sex" clearable placeholder="请选择性别">
          <el-option :value="0" label="男">男</el-option>
          <el-option :value="1" label="女">女</el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-date-picker
          v-model="form.start_time"
          type="daterange"
          value-format="yyyy-MM-dd HH:mm:ss"
          :default-time="['00:00:00', '23:59:59']"
          clearable
          range-separator="至"
          start-placeholder="隔离开始日期"
          end-placeholder="隔离结束日期"
        />
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-refresh" @click="onReset">重置</el-button>
        <el-button icon="el-icon-search" type="primary" @click="onSearch">查询</el-button>
        <el-button icon="el-icon-plus" type="primary" @click="onCreate">创建</el-button>
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
      <el-table-column prop="name" label="姓名" align="center" />
      <el-table-column prop="number" label="身份证号" align="center" width="170">
        <template slot-scope="scope">
          <span v-if="scope.row.number">{{ scope.row.number.replace(/^(.{6})(?:\w+)(.{4})$/, "\$1********\$2") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" align="center">
        <template slot-scope="scope">
          <el-tag size="small" :type="scope.row.sex === '男' ? '' : 'success'">{{ scope.row.sex }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="source" label="接触来源" align="center" show-overflow-tooltip />
      <el-table-column prop="isolate_address" label="隔离地址" align="center" width="200" show-overflow-tooltip />
      <el-table-column align="center" label="隔离开始日期" width="200">
        <template slot-scope="scope">
          <span v-if="scope.row.start_time">{{ utc2beijing(scope.row.start_time, 2) }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="操作" align="center" width="280">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="toDetails(scope.$index, scope.row)"
          >详情</el-button>
          <el-button
            size="mini"
            type="success"
            @click="toComplate(scope.$index, scope.row)"
          >隔离完成</el-button>
          <el-button
            size="mini"
            type="danger"
            @click="toConfirm(scope.$index, scope.row)"
          >转为确诊</el-button>
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
  </div>
</template>

<script>
import * as HTTP from '@/api/epidemic'
import { utc2beijing } from '@/utils/methods'

export default {
  components: {},
  data() {
    return {
      list: [],
      listLoading: true,
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      form: {
        name: '',
        start_time: [],
        sex: ''
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
        type: 0, // 密接者
        ...this.form
      }
      HTTP.getList(params).then(res => {
        if (res.code === 200) {
          res.result.forEach((item, i) => {
            item.index = i + 1
            // item.create_time = utc2beijing(item.create_time, 2)
            item.sex = item.sex === 0 ? '男' : '女'
            item.roles = item.roles === 0 ? '超级管理员' : item.roles === 1 ? '管理员' : '普通用户'
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
        name: '',
        start_time: [],
        sex: ''
      }
    },
    // 新建时打开新页面
    onCreate() {
      this.$router.push({ path: '/epidemic/create-or-edit', query: { type: 'create' }})
    },
    // 查看详情数据
    toDetails(index, row) {
      this.$router.push({
        path: '/epidemic/create-or-edit',
        query: {
          id: row.id,
          type: 'search'
        }
      })
    },
    // 转为确诊
    toConfirm(index, row) {
      this.$router.push({
        path: '/epidemic/create-or-edit',
        query: {
          id: row.id,
          type: 'patient'
        }
      })
    },
    // 隔离完成
    toComplate(index, row) {
      this.$confirm('确认隔离完成，该患者将转为治愈?', '提示', {
        confirmButtonText: '确定',
        cancelButtonText: '取消',
        type: 'warning'
      }).then(() => {
        this.toIsolated(row)
      }).catch(() => {
        this.$message({
          type: 'info',
          message: '已取消'
        })
      })
    },
    // 密接转隔离完成（治愈）
    toIsolated(row) {
      const params = {
        id: row.id,
        update_time: this.dateFormat(''),
        update_user: JSON.parse(sessionStorage.getItem(location.host + '/coronal' + '/info')).account
      }
      HTTP.toIsolated(params).then(res => {
        if (res.code === 200) {
          this.$message.success(res.msg)
          this.onSearch()
        } else {
          this.$message.warning(res.msg)
        }
        this.lading = false
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
