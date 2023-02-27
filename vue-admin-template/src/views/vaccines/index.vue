<template>
  <div class="app-container">
    <el-form ref="form" :model="form" :inline="true">
      <el-form-item>
        <el-input v-model="form.name" clearable placeholder="请输入姓名" />
      </el-form-item>
      <el-form-item>
        <el-input
          v-model="form.vaccines_number"
          clearable
          placeholder="请输入疫苗编号"
        />
      </el-form-item>
      <el-form-item>
        <el-select v-model="form.sex" clearable placeholder="请选择性别">
          <el-option value="男" label="男">男</el-option>
          <el-option value="女" label="女">女</el-option>
        </el-select>
      </el-form-item>
      <el-form-item>
        <el-button icon="el-icon-search" type="primary" @click="onSearch"
          >查询</el-button
        >
        <el-button icon="el-icon-plus" type="primary" @click="onCreate"
          >添加记录</el-button
        >
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
      <el-table-column prop="name" label="接种人姓名" align="center" />
      <el-table-column label="性别" align="center">
        <template slot-scope="scope">
          <el-tag
            size="small"
            :type="scope.row.sex === '男' ? '' : 'success'"
            >{{ scope.row.sex }}</el-tag
          >
        </template>
      </el-table-column>
      <el-table-column
        prop="address"
        label="详细住址"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column
        prop="vaccines_name"
        label="疫苗名称"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column
        prop="vaccines_number"
        label="疫苗编号"
        align="center"
        show-overflow-tooltip
      />
      <el-table-column
        prop="inoculation_site"
        label="接种点名称"
        align="center"
        width="200"
        show-overflow-tooltip
      />
      <el-table-column label="操作" align="center" width="280">
        <template slot-scope="scope">
          <el-button
            size="mini"
            type="primary"
            @click="toDetails(scope.$index, scope.row, 1)"
            >详情</el-button
          >
          <el-button
            size="mini"
            type="success"
            @click="toDetails(scope.$index, scope.row, 0)"
            >编辑</el-button
          >
          <el-button
            size="mini"
            type="danger"
            @click="toDelete(scope.$index, scope.row)"
            >删除</el-button
          >
        </template>
      </el-table-column>
    </el-table>
    <!-- 分页 -->
    <div class="pagination" style="text-align: center; margin-top: 10px">
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
import * as HTTP from "@/api/epidemic";
import { utc2beijing } from "@/utils/methods";

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
        name: "",
        vaccines_number: "",
        sex: "",
      },
    };
  },
  created() {
    this.onSearch();
  },
  methods: {
    // 条件查询
    onSearch(type = true) {
      this.listLoading = true;
      const params = {
        pageNumber: type ? 1 : this.pageNumber,
        pageSize: this.pageSize,
        type: 0, // 密接者
        ...this.form,
      };
      HTTP.getAppointmentInfo(params).then((res) => {
        if (res.code === 200) {
          this.list = res.result;
          this.total = res.total;
        } else {
          this.$message.warning(res.msg);
        }

        this.listLoading = false;
      });
    },
    // 重置清空表单
    onReset() {
      this.form = {
        name: "",
        start_time: [],
        sex: "",
      };
    },
    // 新建时打开新页面
    onCreate() {
      this.$router.push({
        path: "/vaccines/appointment",
        query: { type: "create" },
      });
    },
    // 查看详情数据
    toDetails(index, row, type) {
      this.$router.push({
        path: "/vaccines/appointment",
        query: {
          id: row.id,
          type: !type ? "edit" : "search",
        },
      });
    },
    // 隔离完成
    toDelete(index, row) {
      this.$confirm("确认删除该条预约信息?", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning",
      })
        .then(() => {
          this.deleteOne(row);
        })
        .catch(() => {
          this.$message({
            type: "info",
            message: "已取消",
          });
        });
    },
    // 删除数据
    deleteOne(row) {
      const params = {
        id: row.id,
        update_time: this.dateFormat(""),
        update_user: JSON.parse(
          sessionStorage.getItem(location.host + "/coronal" + "/info")
        ).account,
      };
      HTTP.deleteAppointmentOne(params).then((res) => {
        if (res.code === 200) {
          this.$message.success(res.msg);
          this.onSearch();
        } else {
          this.$message.warning(res.msg);
        }
        this.lading = false;
      });
    },
    handleSizeChange(val) {
      this.pageNumber = 1;
      this.pageSize = val;
      this.onSearch(false);
    },
    handleCurrentChange(val) {
      this.pageNumber = val;
      this.onSearch(false);
    },
    // 时间格式化
    utc2beijing(date, type) {
      return utc2beijing(date, type);
    },
  },
};
</script>
