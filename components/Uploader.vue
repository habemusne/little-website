<template>
<div>
  <el-dialog
    :title="previewer.title"
    :visible.sync="previewer.show"
    :before-close="onPreviewerClose"
    :modal="false"
    size="large">
  </el-dialog>
  <el-upload
    drag
    :file-list="file_list"
    :list-tzype="'text'"
    :on-success="onUploadSuccess"
    :on-preview="onUploadPreview"
    :before-upload="beforeUpload"
    :action="upload_endpoint">
    <i class="el-icon-upload"></i>
    <div class="el-upload__text">Drop file here or <em>click to upload</em></div>
    <div class="el-upload__tip" slot="tip">file with a size less than 500kb</div>
  </el-upload>
</div>
</template>
<script>
export default {
  async created() {
    this.upload_endpoint = '/api/upload'
  },
  data() {
    return {
      upload_endpoint: '',
      previewer: {
        title: 'Current File',
        show: false,
      },
      file_list: [],
    };
  },
  methods: {
    onUploadSuccess(response, file, fileList) {
      this.$emit('uploaded', file.response.s3_key);
    },
    onUploadPreview(file) {
      this.previewer.show = true;
    },
    onPreviewerClose() {
      this.previewer.show = false;
    },
    beforeUpload(file) {
      return true;
    },
  },
};

</script>
<style scoped>
.modal-file {
  width: 100%;
  height: auto;
}

</style>
