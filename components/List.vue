<template>
<el-collapse v-model="active_collapses" @change="on_collapse_change">
  <el-collapse-item :name="project.name" v-for="(project, i) in filtered_projects" :key="i">
    <template slot="title">
      <el-container :ref="project.name">
        <el-header>
          <el-row class="custom-collapse-header">
            <el-col :span="$device.isMobileOrTablet? 4: 2">
              <el-tooltip effect="dark" placement="top" v-for="(demo_type, j) in ['video', 'picture', 'website', 'github']" :key="j" v-if="project.demo_types.includes(demo_type)" :content="icon_info[demo_type].help">
                <i :class="icon_info[demo_type].icon" @click.prevent.stop aria-hidden="true"></i>
              </el-tooltip>
              <div style="display: hidden; min-height: 1px;"></div>
            </el-col>
            <el-col :span="$device.isMobileOrTablet? 18: 20" class="custom-collapse-header-text">
              <div style="float:left">{{ project.human_name }}</div>
              <div style="float:left; margin-left: 20px" v-show="$device.isDesktop" class="secondary-text">{{ project.short_desc }}</div>
            </el-col>
          </el-row>
        </el-header>
      </el-container>
    </template>
    <el-container>
      <el-main>
        <p class="secondary-text" v-if="$device.isMobileOrTablet">{{ project.short_desc }}</p>
        <p class="desc">{{ project.desc }}</p>
        <div v-html="project.intro_content"></div>
        <hr style="width:20%z">
        <div class="custom-footer secondary-text">
          <table cellpadding="5">
            <tr>
              <td>At company</td>
              <td>{{ project.company }}</td>
            </tr>
            <tr>
              <td>Role</td>
              <td>{{ project.roles.join(' --> ') }}</td>
            </tr>
            <tr>
              <td>Supervised by Architect</td>
              <td>{{ project.supervised_by_architect ? 'Yes' : 'No' }}</td>
            </tr>
            <tr>
              <td>Features Responsible</td>
              <td><el-progress :percentage="project.percentage_feature_responsible"></el-progress></td>
            </tr>
            <tr>
              <td>Code Contribution</td>
              <td><el-progress :percentage="project.percentage_code_contribution"></el-progress></td>
            </tr>
            <tr>
              <td>Active Through</td>
              <td>{{ project.active_start  }} - {{ project.active_end }}</td>
            </tr>
            <tr>
              <td>Current Maintainer?</td>
              <td>{{ project.current_maintainer ? 'Yes': 'No' }}</td>
            </tr>
            <tr>
              <td>Funded?</td>
              <td>{{ project.funded ? 'Yes': 'No' }}</td>
            </tr>
            <tr>
              <td>Code Repository</td>
              <td v-if="project.code_repo.startsWith('http')">
                <a :href="project.code_repo" target="_blank">{{ project.code_repo }}</a>
              </td>
              <td v-else>{{ project.code_repo }}</td>
            </tr>
            <tr>
              <td>Updated</td>
              <td>{{ project.updated }}</td>
            </tr>
          </table>
        </div>
        <div><el-tag v-for="(tag, j) in project.tech_tags" :key="j" :type="tech_to_type ? tech_to_type[tag] : 'info'" class="project-tag">{{ tag }}</el-tag></div>
      </el-main>
    </el-container>
  </el-collapse-item>
</el-collapse>
</template>

<script>
const $ = process.browser ? require('jquery') : null

export default {
  props: ['active_collapses', 'filtered_projects', 'tech_categories'],
  data() {
    return {
      icon_info: {
        video: {
          icon: 'fa fa-film',
          help: 'Video available for demo',
        },
        picture: {
          icon: 'fa fa-picture-o',
          help: 'Pictures available for demo',
        },
        website: {
          icon: 'fa fa-chrome',
          help: 'Website available for demo',
        },
        github: {
          icon: 'fa fa-file-code-o',
          help: 'Source code is public',
        },
      },
    }
  },
  computed: {
    tech_to_type() {
      let dict = {}
      for (var category in this.tech_categories) {
        for (var i in this.tech_categories[category].tech_tags) {
          dict[this.tech_categories[category].tech_tags[i]] = this.tech_categories[category].type
        }
      }
      return dict
    },
  },
  methods: {
    on_collapse_change(active_collapses) {
      // Youtube size
      this.$nextTick(function() {
        if (this.$device.isMobileOrTablet) {
          const allVideos = $("iframe")
          allVideos.each(function() {
            $(this)
              .data('aspectRatio', this.height / this.width)
              .removeAttr('height')
              .removeAttr('width');
          });
        }
      })
    },
  },
}
</script>

<style scoped lang='sass'>
@import '~assets/variables.sass'

.project-tag
  margin-right: 0.3rem

.custom-footer
  height: auto !important
  line-height: 1.5rem

.secondary-text
  color: #9E9E9E
  font-size: 0.9rem

.custom-collapse-header
  font-size: 0.9rem
  i
    margin-right: 0.3rem
    color: #007bff
  .custom-collapse-header-text
    text-overflow: ellipsis
    white-space: nowrap
    overflow: hidden

.intro-large
  font-size: 30px
  font-weight: 100

.desc
  font-weight: 100
  font-style: italic
  margin-bottom: 2rem
  font-size: 0.9rem !important

.el-input__inner
  width: auto !important

</style>
