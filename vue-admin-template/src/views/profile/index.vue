<template>
  <div class="app-container">
    <div v-if="user">
      <el-row :gutter="20">

        <el-col :span="6" :xs="24">
          <user-card :user="user" />
        </el-col>

        <el-col :span="18" :xs="24">
          <el-card>
            <el-tabs v-model="activeTab">
              <el-tab-pane label="基本信息" name="base">
                <account :user="user" @updateUserInfo="getUser" />
              </el-tab-pane>
              <!-- <el-tab-pane label="操作记录" name="record">
                <activity />
              </el-tab-pane> -->
            </el-tabs>
          </el-card>
        </el-col>

      </el-row>
    </div>
  </div>
</template>

<script>
import UserCard from './components/UserCard'
import Account from './components/Account'

export default {
  name: 'Profile',
  components: { UserCard, Account },
  data() {
    return {
      user: {},
      activeTab: 'base'
    }
  },
  created() {
    this.getUser()
  },
  methods: {
    getUser() {
      const info = JSON.parse(sessionStorage.getItem(location.host + '/coronal' + '/info'))
      this.user = {
        name: info.account,
        role: info.roles,
        email: info.email,
        avatar: ''
      }
    }
  }
}
</script>
