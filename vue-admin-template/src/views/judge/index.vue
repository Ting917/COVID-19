<template>
  <div class="app-container">
    <el-form
      ref="formRules"
      :model="formRules"
      class="cascader-style"
      :inline="true"
      label-width="80px"
    >
      <el-form-item label="区域">
        <el-select
          v-model="formRules.address"
          filterable
          remote
          clearable
          reserve-keyword
          placeholder="请输入关键词"
          :remote-method="remoteMethod"
          :loading="searchLoading"
          @change="handleChange"
        >
          <el-option
            v-for="(item, index) in options"
            :key="index"
            :label="item.label"
            :value="item.value"
          />
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" type="primary" @click="onSearch">查询</el-button>
      </el-form-item>
      <el-tag v-if="list.length > 0 && ![null, ''].includes(formRules.address) && searchFlg" style="margin-top: 5px;margin-left: 50px;" type="danger">有密接风险</el-tag>
      <el-tag v-if="list.length == 0 && ![null, ''].includes(formRules.address) && searchFlg" style="margin-top: 5px;margin-left: 50px;" type="success">无风险</el-tag>
    </el-form>
    <el-table
      v-loading="loading"
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
          <span>{{ scope.row.number.replace(/^(.{6})(?:\w+)(.{4})$/, "\$1********\$2") }}</span>
        </template>
      </el-table-column>
      <el-table-column label="性别" align="center">
        <template slot-scope="scope">
          <el-tag size="small" :type="scope.row.sex === '男' ? '' : 'success'">{{ scope.row.sex }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="source" label="接触来源" align="center" show-overflow-tooltip />
      <el-table-column prop="address" label="地址" align="center" width="200" show-overflow-tooltip />
      <el-table-column align="center" label="更新时间" width="200">
        <template slot-scope="scope">
          <span v-if="scope.row.update_time">{{ utc2beijing(scope.row.update_time, 1) }}</span>
          <span v-else>--</span>
        </template>
      </el-table-column>
      <el-table-column label="类别" align="center">
        <template slot-scope="scope">
          <el-tag size="small" :type="scope.row.is_patiented ? 'danger' : 'warning'">{{ scope.row.is_patiented ? '有确诊' : '有密接' }}</el-tag>
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
      loading: false,
      searchLoading: false,
      pageNumber: 1,
      pageSize: 10,
      total: 0,
      list: [],
      formRules: {
        address: ''
        // time: ''
      },
      options: [],
      searchFlg: false
    }
  },
  created() {
    this.onSearch()
  },
  methods: {
    // 查询所有密接、确诊患者数据
    onSearch(type = true) {
      this.searchFlg = true
      this.loading = true
      const params = {
        pageNumber: type ? 1 : this.pageNumber,
        pageSize: this.pageSize,
        type: 4, // 密接和确诊
        ...this.formRules
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

        this.loading = false
      })
    },
    // 远程搜索地址关键词
    remoteMethod(query) {
      this.searchFlg = false
      if (query !== '') {
        this.searchLoading = true
        const params = {
          type: 5,
          address: query
        }
        HTTP.getList(params).then(res => {
          this.options = []
          if (res.code === 200) {
            const temp = []
            if (res.result.length > 0) {
              res.result.forEach(item => {
                temp.push({ value: item.address, label: item.address })
              })
              this.options = temp
            }
          } else {
            this.$message.warning(res.msg)
          }
          this.searchLoading = false
        })
      } else {
        this.options = []
      }
    },
    // 下拉选项改变重置标识
    handleChange(val) {
      this.searchFlg = false
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
<style lang="scss">
.cascader-style{
  .el-cascader{
    min-width: 400px;
  }
}
</style>
