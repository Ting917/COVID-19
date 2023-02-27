<template>
  <div>
    <el-card style="margin-bottom: 20px">
      <div slot="header" class="clearfix">
        <span>个人信息</span>
      </div>

      <div class="user-profile">
        <div class="box-center">
          <img
            :src="imageUrl"
            class="user-avatar"
            @mouseenter="modalFlg = true"
          />
          <div
            v-if="modalFlg"
            class="modal-style"
            @mouseleave="modalFlg = false"
            @click="dialogVisible = true"
          >
            <div class="absolute-center">更换头像</div>
          </div>
        </div>
        <div class="box-center">
          <div class="user-name text-center">{{ user.name }}</div>
          <!-- <div class="user-role text-center text-muted">{{ user.role }}</div> -->
        </div>
      </div>

      <div class="user-bio">
        <div class="user-skills user-bio-section">
          <!-- <div class="user-bio-section-header">
            <svg-icon icon-class="skill" /><span>技能</span>
          </div> -->
          <!-- <div class="user-bio-section-body">
            <div class="progress-item">
              <span>Vue</span>
              <el-progress :percentage="70" />
            </div>
            <div class="progress-item">
              <span>JavaScript</span>
              <el-progress :percentage="18" />
            </div>
            <div class="progress-item">
              <span>Css</span>
              <el-progress :percentage="12" />
            </div>
            <div class="progress-item">
              <span>ESLint</span>
              <el-progress :percentage="100" status="success" />
            </div>
          </div> -->
        </div>

        <div class="user-education user-bio-section">
          <div class="user-bio-section-body">
            <div class="text-muted" style="text-align: center">
              <el-button type="primary" @click="back">返回上一页</el-button>
            </div>
          </div>
        </div>
      </div>
    </el-card>
    <!-- 用户更换头像对话框 -->
    <el-dialog
      title="更换头像"
      :visible.sync="dialogVisible"
      width="400px"
      append-to-body
    >
      <el-upload
        ref="upload"
        :accept="accept"
        :action="uploadFilesUrl"
        :on-change="handleChange"
        :on-remove="handleRemove"
        :file-list="fileList"
        :auto-upload="false"
        drag
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em></div>
        <div slot="tip" class="el-upload__tip text-center">
          <span>仅允许导入jpg、png格式的图片。</span>
        </div>
      </el-upload>
      <div slot="footer" class="dialog-footer">
        <el-button type="primary" @click="submitFileForm">确 定</el-button>
        <el-button @click="doClose">取 消</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import * as HTTP from "@/api/user";
export default {
  props: {
    user: {
      type: Object,
      default: () => {
        return {
          name: "",
          email: "",
          avatar: "",
          role: "",
        };
      },
    },
  },
  data() {
    return {
      modalFlg: false,
      dialogVisible: false,
      uploadFilesUrl: process.env.VUE_APP_BASE_API + "/api/file/uploadFile", // 文件上传地址
      accept: ".jpg,.png,.JPG,.PNG",
      fileList: [],
      imageUrl: JSON.parse(
        sessionStorage.getItem(location.host + "/coronal" + "/info")
      ).img_url,
      image: "",
    };
  },
  methods: {
    // 文件上传
    async handleChange(file) {
      const name = file.name.split(".")[file.name.split(".").length - 1]; // 获取文件类型
      // 格式、限制校验
      if (!["JPG", "PNG"].includes(name.toUpperCase())) {
        this.$message.warning("上传图片格式不支持");
        this.handleRemove(file);
        return;
      }
      if (file.size / 1024 > 5 * 1024) {
        this.$message.warning("单个文件不能超过5M");
        this.handleRemove(file);
        return;
      }
      if (this.fileList.length === 1 || this.fileList.length > 1) {
        this.$message.warning("最多支持上传一张图片");
        this.handleRemove(file);
        return;
      }
      this.fileList.push(file);
    },
    // 已上传文件删除
    handleRemove(file) {
      this.fileList = this.fileList.filter((item) => {
        return item.uid !== file.uid;
      });
    },
    // 图片上传执行
    submitFileForm() {
      console.log(this.fileList);
      // 将图片转为base64格式
      const that = this;
      const reader = new FileReader();
      reader.onloadend = function () {
        that.image = reader.result;
        that.updateImg();
      };
      reader.readAsDataURL(this.fileList[0].raw);
    },
    updateImg() {
      var that = this;
      const params = {
        update_time: that.dateFormat(""),
        imageBase64Str: that.image,
        type: 1,
      };
      HTTP.updateImg(params).then((res) => {
        if (res.code === 200) {
          that.$message.success(res.msg);
          that.doClose();
          that.imageUrl = that.image;
          this.$store.dispatch("user/changePicture", that.image);
          const temp = JSON.parse(
            sessionStorage.getItem(location.host + "/coronal" + "/info")
          );
          temp.img_url = that.image;
          sessionStorage.setItem(
            location.host + "/coronal" + "/info",
            JSON.stringify(temp)
          );
        } else {
          that.$message.warning(res.msg);
        }
      });
    },
    doClose() {
      this.fileList = [];
      this.dialogVisible = false;
    },
    back() {
      this.$router.go(-1);
    },
  },
};
</script>

<style lang="scss" scoped>
.box-center {
  margin: 0 auto;
  display: table;
}
.modal-style {
  position: absolute;
  top: 87px;
  height: 70px;
  width: 70px;
  background: rgba(0, 0, 0, 0.54);
  color: #fff;
  cursor: pointer;
  border-radius: 50%;
}
.user-avatar {
  cursor: pointer;
  width: 70px;
  height: 70px;
  border-radius: 50%;
}
.text-muted {
  color: #777;
}

.user-profile {
  .user-name {
    font-weight: bold;
  }

  .box-center {
    padding-top: 10px;
  }

  .user-role {
    padding-top: 10px;
    font-weight: 400;
    font-size: 14px;
  }

  .box-social {
    padding-top: 30px;

    .el-table {
      border-top: 1px solid #dfe6ec;
    }
  }

  .user-follow {
    padding-top: 20px;
  }
}

.user-bio {
  margin-top: 20px;
  color: #606266;

  span {
    padding-left: 4px;
  }

  .user-bio-section {
    font-size: 14px;
    padding: 15px 0;

    .user-bio-section-header {
      border-bottom: 1px solid #dfe6ec;
      padding-bottom: 10px;
      margin-bottom: 10px;
      font-weight: bold;
    }
  }
}
</style>
