<template>
  <div class="dashboard-editor-container">
    <panel-group :panel-list="panelList" @handleSetLineChartData="handleSetLineChartData" />
    <!-- 搜索区域 -->
    <div class="block" style="padding: 25px 25px 0 25px;">
      <el-form ref="form" :model="form" :inline="true">
        <el-form-item label="请选择更新日期">
          <el-date-picker
            v-model="form.time"
            type="daterange"
            value-format="yyyy-MM-dd HH:mm:ss"
            clearable
            range-separator="至"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            :picker-options="expireDateOption"
            @change="getTopData"
          />
        </el-form-item>
        <el-form-item label="">
          <span class="special-tips"><i class="el-icon-warning-outline" />为确保数据展示效果，可筛选的时间间隔为3 ~ 7天，选中时间段后页面全部数据将刷新</span>
        </el-form-item>
      </el-form>
    </div>
    <!-- 折线图 -->
    <el-row class="block">
      <div class="chart-wrapper">
        <div ref="line_chart" style="height: 500px; width: 100%;" />
      </div>
    </el-row>
    <!-- 饼图、柱状图 -->
    <el-row :gutter="20">
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <div ref="raddar_chart" style="height: 500px; width: 100%;" />
        </div>
      </el-col>
      <el-col :xs="24" :sm="24" :lg="12">
        <div class="chart-wrapper">
          <div ref="bar_chart" style="height: 500px; width: 100%;" />
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script>
import * as echarts from 'echarts'
import PanelGroup from './components/PanelGroup'
import * as HTTP from '@/api/dashboard'
import { getCurrentTime, utc2beijing } from '@/utils/methods'

export default {
  name: 'DashboardAdmin',
  components: {
    PanelGroup
  },
  data() {
    return {
      panelList: {}, // 上方模块
      total: [],
      form: {
        time: []
      },
      expireDateOption: { // 禁用今天之后的日期
        disabledDate(date) {
          return date.getTime() > Date.now()
        }
      }
    }
  },
  mounted() {
    this.getTopData()
  },
  methods: {
    // 获取页面全部数据
    getTopData(val = null) {
      const params = {
        ...this.form
      }
      let days = []
      if (params.time && params.time.length > 1) {
        params.time[0] = params.time[0].split(' ')[0] + ' 00:00:00'
        params.time[1] = params.time[1].split(' ')[0] + ' 23:59:59'
      }
      if (val === null) {
        // 未选择时间段，默认查最近七天
        days = this.getTitle()
      } else {
        // 选择特定时间段
        days = this.getRangeDate(new Date(params.time[0]), new Date(params.time[1]))
        if (days.length < 3 || days.length > 7) {
          // 如果时间跨度小于三天或大于七天则停止
          this.$message.warning('时间跨度范围应在3 ~ 7天内')
          this.form.time = []
          return
        }
      }
      HTTP.getTopData(params).then(res => {
        if (res.code === 200) {
          this.panelList = res.result
          this.total = res.total
          // 图表所需数据处理 start--------------------------------
          const data = { ...this.panelList }
          const list = []
          let date = {}
          let date2 = {}
          let date3 = {}
          let date4 = {}
          // 遍历数组统计人数生成图表数据
          if (data.patient && data.patient.length > 0) {
            date = this.setChartData(data.patient, days)
            list.push({ name: '确诊', type: 'line', data: Object.values(date) })
          }
          if (data.trace && data.trace.length > 0) {
            date2 = this.setChartData(data.trace, days)
            list.push({ name: '密接', type: 'line', data: Object.values(date2) })
          }
          if (data.cure && data.cure.length > 0) {
            date3 = this.setChartData(data.cure, days)
            list.push({ name: '治愈', type: 'line', data: Object.values(date3) })
          }
          if (data.death && data.death.length > 0) {
            date4 = this.setChartData(data.death, days)
            list.push({ name: '死亡', type: 'line', data: Object.values(date4) })
          }
          // 图表所需数据处理 end--------------------------------
          // 图表渲染
          this.$nextTick(() => {
            this.getRaddarChart() // 获取饼图
            this.getBarChart(list, days) // 获取柱状图
            this.getLineChart(list, days) // 获取折线图
          })
        } else {
          this.$message.warning(res.msg)
        }
      })
    },
    // 饼图
    getRaddarChart() {
      const myChart = echarts.init(this.$refs.raddar_chart)
      const option = {
        tooltip: {
          trigger: 'item',
          formatter: '{b}({d}%)'
        },
        legend: {
          top: '5%',
          left: 'center'
        },
        series: [
          {
            type: 'pie',
            radius: ['40%', '70%'],
            avoidLabelOverlap: false,
            itemStyle: {
              borderRadius: 10,
              borderColor: '#fff',
              borderWidth: 2
            },
            label: {
              show: false,
              position: 'center'
            },
            emphasis: {
              label: {
                show: true,
                fontSize: '40',
                fontWeight: 'bold'
              }
            },
            labelLine: {
              show: false
            },
            data: this.total
          }
        ]
      }
      myChart.setOption(option, true)
    },
    // 柱状图
    getBarChart(list, days) {
      const arr = list
      arr.forEach(x => {
        x.type = 'bar'
        delete x.stack
      })
      const myChart = echarts.init(this.$refs.bar_chart)
      const option = {
        tooltip: {},
        legend: {},
        xAxis: {
          type: 'category',
          boundaryGap: true,
          data: days,
          axisLabel: {
            interval: 0,
            rotate: days.length > 3 ? 45 : 0
          }
        },
        yAxis: {
          minInterval: 1,
          type: 'value'
        },
        series: arr
      }
      myChart.setOption(option, true)
    },
    // 折线图
    getLineChart(list, days) {
      const arr = list
      arr.forEach(x => {
        x.type = 'line'
        delete x.stack
      })
      const myChart = echarts.init(this.$refs.line_chart)
      const option = {
        title: {
          text: '数据变化趋势折线图'
        },
        tooltip: {
          trigger: 'axis'
        },
        legend: {
          data: ['确诊', '密接', '治愈', '死亡']
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: {
          type: 'category',
          data: days
        },
        yAxis: {
          minInterval: 1,
          type: 'value'
        },
        series: arr
      }
      myChart.setOption(option, true)
    },
    // 按照选定天数（不选默认七天）的时间格式处理图表数据
    setChartData(data, days) {
      const date = {}
      data.forEach(x => {
        x.update_time = utc2beijing(x.update_time, 2)
        for (let i = 0; i < days.length; i++) { // 循环日期将没有数据的补0
          if (days[i] === x.update_time) {
            if (!date[days[i]]) {
              date[days[i]] = 1
            } else {
              date[days[i]] += 1
            }
            break
          } else {
            if (!date[days[i]]) {
              date[days[i]] = 0
            }
          }
        }
      })
      return date
    },
    // 取数组中的最大值
    getMaxIndex(list) {
      const arr = list
      let max = arr[0] // 假定第一个为最大值
      let maxIndex = 0
      for (let i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
          max = arr[i]
          maxIndex = i
        }
      }
      return maxIndex
    },
    // 生成近七天的数据作为图表x轴
    getTitle() {
      const days = []
      const current = new Date().getTime() // 获取当前的时间
      for (let i = 0; i < 7; i++) {
        const date = new Date(current - i * 24 * 60 * 60 * 1000)
        const day = getCurrentTime(2, date)
        days.unshift(day)
      }
      return days
    },
    // 生成特定时间段内的所有时间数据作为图表x轴
    getRangeDate(start, end) {
      const days = []
      const len = Math.round((end - start) / (24 * 60 * 60 * 1000))
      for (let i = 0; i < len; i++) {
        const date = new Date(end - i * 24 * 60 * 60 * 1000)
        const day = getCurrentTime(2, date)
        days.unshift(day)
      }
      return days
    },
    // 时间格式化
    utc2beijing(date, type) {
      return utc2beijing(date, type)
    },
    getCurrentTime(type, num) {
      return getCurrentTime(type, num)
    },
    // 点击跳转不同页面
    handleSetLineChartData(type) {
      switch (type) {
        case 1:
          // 跳转疫情管理 - 确诊
          this.$router.push({ path: '/epidemic/patient' })
          break
        case 2:
          // 跳转疫情管理 - 密接
          this.$router.push({ path: '/epidemic/contact' })
          break
        case 3:
          // 跳转疫情管理 - 治愈
          this.$router.push({ path: '/epidemic/cure' })
          break
        case 4:
          // 跳转疫情管理 - 死亡
          this.$router.push({ path: '/epidemic/death' })
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.dashboard-editor-container {
  padding: 32px;
  background-color: rgb(240, 242, 245);
  position: relative;

  .github-corner {
    position: absolute;
    top: 0px;
    border: 0;
    right: 0;
  }
  .block{
    background:#fff;
    padding:16px 16px 0;
    margin-bottom:32px;
  }
  .chart-wrapper {
    background: #fff;
    padding: 16px 16px 0;
    margin-bottom: 32px;
  }
  .special-tips{
    margin-left: 20px;
    color: red;
    font-size: 13px;
  }
}

@media (max-width:1024px) {
  .chart-wrapper {
    padding: 8px;
  }
}
</style>
