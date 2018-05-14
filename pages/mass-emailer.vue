<template>
<div class="container">
  <el-form label-width="120px">
    <el-form-item required>
      <el-input placeholder="sender_account@email.com" v-model="form_data.sender_email_account"></el-input>
    </el-form-item>
    <el-form-item required>
      <el-input placeholder="sender_email_password" v-model="form_data.sender_password" type="password"></el-input>
    </el-form-item>
    <el-form-item required>
      <el-input placeholder="sender's email's smtp server" v-model="form_data.smtp_server"></el-input>
    </el-form-item>
    <el-form-item required>
      <el-input placeholder="Hi {name}, this is the subject of the email" v-model="form_data.subject_template"></el-input>
    </el-form-item>
    <el-form-item required>
      <el-input rows=10 type="textarea" :placeholder="message_template_example" v-model="form_data.message_template"></el-input>
    </el-form-item>
    <el-form-item required>
      <el-input :placeholder="'How many seconds to wait between sending emails'" v-model="form_data.message_delay"></el-input>
    </el-form-item>
    <el-form-item required>
      <uploader @uploaded="uploaded(...arguments)"></uploader>
    </el-form-item>
    <el-form-item required>
      <el-button type="primary" @click="submit">Submit</el-button>
    </el-form-item>
  </el-form>
</div>
</template>

<script>
import Uploader from '@/components/Uploader'
import axios from 'axios'

const message_template_example = "Hi {name},\n\nHereby I formally inform you that, as I found out that you are a {characteristic} person, I intend to send you this email.\n\nMark\nSoftware Engineer"

export default {
  components: { Uploader },
  data() {
    return {
      form_data: {
        sender_email_account: '',
        sender_password: '',
        smtp_server: '',
        message_template: '',
        subject_template: '',
        receivers_data_csv_s3_key: '',
        message_delay: '',
      },
      message_template_example,
    }
  },
  methods: {
    uploaded(s3_key) {
      this.form_data.receivers_data_csv_s3_key = s3_key
    },
    submit() {
      axios.post('/api/mass-send', this.form_data)
    },
  },
}
</script>

<style scoped>
.container {
  width: 50%;
  margin-left: auto;
  margin-right: auto;
  text-align: center;
}
</style>
