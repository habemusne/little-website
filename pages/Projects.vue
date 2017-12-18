<template>
<b-row ref="hehe">
  <b-col :sm="$device.isDesktop ? 8 : 12">
    <h2>My Projects</h2>
    <div style="width: 100%; min-height: 1px">
      <div v-if="$device.isDesktop">
        <el-button type="primary" @click="show_timeline = !show_timeline">{{ `${show_timeline ? 'Hide' : 'Show'}` }} Timeline</el-button>
        <br/><br/>
        <b-card v-show="show_timeline">
          <div ref="timeline"></div>
        </b-card>
      </div>
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
<!--                     <div style="float:left; margin-left: 20px">
                      <el-tag v-for="(tag, j) in project.implicit_tags" :key="j" class="project-tag" :type="get_implicit_tag_color(tag)">{{ tag }}</el-tag>
                    </div> -->
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
                    <td>Supervised by Architech</td>
                    <td>{{ project.supervised_by_architech ? 'Yes' : 'No' }}</td>
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
    </div>
  </b-col>
  <b-col :span="4" v-if="$device.isDesktop">
    <el-container>
      <el-main>
        <h1>Filters</h1>
        <el-collapse v-model="opened_filters">
          <el-collapse-item v-for="(item, i) in filter_items" :key="i" :title="item.human_readable" :name="item.name">
            <el-select v-if="item.type === 'select'" v-model="applied_filters[item.name]" :multiple="item.multiple" filterable reserve-keyword clearable placeholder="Please select">
              <el-option v-for="(option, i) in item.options" :key="i" :label="option.label" :value="option.value">
              </el-option>
            </el-select>
            <div v-if="item.type === 'date_range'">
<!--               <el-date-picker
                v-model="applied_filters[item.name].start"
                type="daterange"
                align="right"
                unlink-panels
                range-separator="To"
                start-placeholder="Start date"
                end-placeholder="End date"
                :picker-options="pickerOptions2">
              </el-date-picker>
 -->            </div>
            <div v-if="item.type === 'progress'">
              <el-slider
                v-model="applied_filters[item.name]"
                range
                show-stops
                :max="100">
              </el-slider>
              <p>{{ applied_filters[item.name][0] }}%-{{ applied_filters[item.name][1] }}%</p>
            </div>
          </el-collapse-item>
        </el-collapse>
      </el-main>
    </el-container>
  </b-col>
</b-row>
</template>

<script>
// import projects from '~/helpers/projects'
import { uniq, flatten, intersection, slice } from 'lodash'
import axios from 'axios'
const fs = process.server ? require('fs-extra') : null
const $ = process.browser ? require('jquery') : null

export default {
  async asyncData() {
    if (process.browser) {
      const response = await axios.get('/projects.json')
      return { projects: response.data }
    } else {
      const projects = JSON.parse(fs.readFileSync('static/projects.json', 'utf8'))
      return { projects }
    }
  },
  mounted: function() {
    // Load timeline
    if (this.$device.isDesktop) {
      const timeline_items = this.projects.map((project, id) => {
        return {
          id,
          project,
          start: project.active_start.split('/').join('-'),
          end: project.active_end ? project.active_end.split('/').join('-') : null,
          title: `${project.human_name}: ${project.short_desc}`,
        }
      })
      const timeline_options = {
        template: function(item, element, data) {
          return `<a href="#${item.project.name}" class="timeline-item" style="text-decoration: none"><div>${item.project.human_name}</div></a>`
        },
      }
      new vis.Timeline(this.$refs.timeline, timeline_items, timeline_options);
    }

    // Scroll
    if (this.$route.hash) {
      const target_project_name = this.$route.hash.slice(1)
      this.filtered_projects.map(project => {
        if (project.name === target_project_name) {
          this.active_collapses.push(target_project_name)
          const vm = this
          setTimeout(function() {
            console.log(vm.$refs[target_project_name][0])
            vm.$SmoothScroll(vm.$refs[target_project_name][0].$el)
          }, 500)
        }
      })
    }
  },
  data() {
    return {
      active_collapses: [],
      show_timeline: false,
      opened_filters: [],
      applied_filters: {
        tech_tags: [],
        companies: [],
        roles: [],
        supervised_by_architech: '',
        current_maintainer: '',
        funded: '',
        percentage_feature_responsible: [0, 100],
        percentage_code_contribution: [0, 100],
        active_through: {
          start: '',
          end: '',
        }
      },
      tech_categories: {
        'Computer Networking & Security': {
          tech_tags: ['AWS EB', 'AWS SQS', 'AWS S3', 'AWS Lambda', 'AWS SimpleWorkflow', 'Aliyun', 'AWS VPC', 'jwt', 'AWS ECS', 'Docker', 'Vagrant', 'Wechat SDK', 'Passenger', 'pm2', 'nginx'],
          type: 'default',
        },
        'Backend Framework & Database': {
          tech_tags: ['Django', 'NodeJS', 'Swagger', 'SQL Server', 'Postgres', 'Knex', 'Sequelize', 'Bookshelf', 'MongoDB', 'Ruby on Rails', 'ActiveRecord'],
          type: 'success',
        },
        'Frontend': {
          tech_tags: ['VueJS', 'ReactJS', 'GraphQL', 'Sass', 'Webpack', 'MeteorJS', 'Framework7', 'Selenium', 'AngularJS', 'JsPsych'],
          type: 'info',
        },
        'Data Manipulation': {
          tech_tags: ['Pandas', 'Scrapy', 'Amazon Mechanical Turk', 'Numpy', 'Matlab'],
          type: 'success',
        },
        'Language': {
          tech_tags: ['Python', 'Bash', 'Javascript', 'php'],
          type: 'info',
        },
      },
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
  methods: {
    generate_project_title(project) {
      if (this.$device.isMobileOrTablet) {
        return project.human_name
      } else {
        return `${project.human_name}: ${project.short_desc }`
      }
    },
    get_implicit_tag_color(tag) {
      if (tag === 'Cloud') {
        return 'default'
      } else if (tag === 'Web') {
        return 'info'
      } else if (tag === 'Database') {
        return 'success'
      } else {
        return 'warning'
      }
    },
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
  computed: {
    filter_items() {
      return [{
        type: 'select',
        multiple: true,
        name: 'tech_tags',
        human_readable: 'Tech Tags',
        options: this.all_tech_tags ? this.all_tech_tags : [],
        filter_function: project => {
          return intersection(project.tech_tags, this.applied_filters.tech_tags).length > 0
        },
      }, {
        type: 'select',
        multiple: true,
        name: 'companies',
        human_readable: 'Companies',
        options: this.all_companies ? this.all_companies : [],
        filter_function: project => {
          return this.applied_filters.companies.includes(project.company)
        },
      }, {
        type: 'select',
        multiple: true,
        name: 'roles',
        human_readable: 'Roles',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
        options: this.all_roles ? this.all_roles : [],
        filter_function: project => {
          return intersection(project.roles, this.applied_filters.roles).length > 0
        },
      }, {
        type: 'select',
        multiple: false,
        name: 'supervised_by_architech',
        human_readable: 'Supervised by Architech',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
        filter_function: project => {
          return this.applied_filters.supervised_by_architech === project.supervised_by_architech
        },
      }, {
        type: 'select',
        multiple: false,
        name: 'current_maintainer',
        human_readable: 'Current Maintainer?',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
        filter_function: project => {
          return this.applied_filters.current_maintainer === project.current_maintainer
        },
      }, {
        type: 'select',
        multiple: false,
        name: 'funded',
        human_readable: 'Funded?',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
        filter_function: project => {
          return this.applied_filters.funded === project.funded
        },
      }, {
        type: 'progress',
        name: 'percentage_feature_responsible',
        human_readable: '% Features Responsible',
        filter_function: project => {
          return project.percentage_feature_responsible >= this.applied_filters.percentage_feature_responsible[0] && project.percentage_feature_responsible <= this.applied_filters.percentage_feature_responsible[1]
        },
      }, {
        type: 'progress',
        name: 'percentage_code_contribution',
        human_readable: '% Code Contribution',
        filter_function: project => {
          return project.percentage_code_contribution >= this.applied_filters.percentage_code_contribution[0] && project.percentage_code_contribution <= this.applied_filters.percentage_code_contribution[1]
        },
      }]
    },
    tech_to_type() {
      let dict = {}
      for (var category in this.tech_categories) {
        for (var i in this.tech_categories[category].tech_tags) {
          dict[this.tech_categories[category].tech_tags[i]] = this.tech_categories[category].type
        }
      }
      return dict
    },
    all_tech_tags() {
      const items = uniq(flatten(Object.keys(this.tech_categories).map(key => {
        return this.tech_categories[key].tech_tags
      })))
      return items.map(item => {
        return { label: item, value: item }
      })
    },
    all_companies() {
      const items = uniq(this.projects.map(item => item.company))
      return items.map(item => {
        return { label: item, value: item }
      })
    },
    all_roles() {
      const items = uniq(flatten(this.projects.map(item => item.roles)))
      return items.map(item => {
        return { label: item, value: item }
      })
    },
    filtered_projects() {
      let result = []
      let should_add
      for (var i in this.projects) {
        should_add = true
        for (var j in this.filter_items) {
          if (this.applied_filters[this.filter_items[j].name].length === 0) continue
          if (!this.filter_items[j].filter_function(this.projects[i])) {
            should_add = false
          }
        }
        if (should_add) result.push(this.projects[i])
      }
      return result
    },
  },
}
</script>

<style scoped lang="sass">
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

.el-select
  width: 100%

.el-slider
  width: 90%
  margin: auto

.timeline-item
  font-size: 0.9rem

</style>
