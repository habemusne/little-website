<template>
<b-row ref="hehe">
  <el-dialog title="Filters" :visible.sync="show_filter_panel" :width="$device.isDesktop ? '80%' : '95%'">
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
  </el-dialog>
  <b-col :sm="12">
    <div class="page-title">
      <h2>My Projects</h2>
      <div><i class="fa fa-filter fa-lg" @click="show_filter_panel = !show_filter_panel"></i></div>
    </div>
    <div style="width: 100%; min-height: 1px">
      <div v-if="$device.isDesktop">
        <el-button type="primary" @click="show_timeline = !show_timeline">{{ `${show_timeline ? 'Hide' : 'Show'}` }} Timeline</el-button>
        <br/><br/>
        <b-card v-show="show_timeline">
          <div ref="timeline"></div>
        </b-card>
      </div>
      <list :active_collapses="active_collapses" :filtered_projects="filtered_projects" :tech_categories="tech_categories"></list>
    </div>
  </b-col>
</b-row>
</template>

<script>
// import projects from '~/helpers/projects'
import List from '~/components/List'
import { uniq, flatten, intersection, slice } from 'lodash'
import axios from 'axios'
const fs = process.server ? require('fs-extra') : null

export default {
  components: { List },
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
      show_filter_panel: false,
      active_collapses: [],
      show_timeline: false,
      opened_filters: [],
      applied_filters: {
        tech_tags: [],
        companies: [],
        roles: [],
        supervised_by_architect: '',
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
        name: 'supervised_by_architect',
        human_readable: 'Supervised by Architect',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
        filter_function: project => {
          return this.applied_filters.supervised_by_architect === project.supervised_by_architect
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

.el-input__inner
  width: auto !important

.el-select
  width: 100%

.el-slider
  width: 90%
  margin: auto

.timeline-item
  font-size: 0.9rem

.page-title
  height: 60px
  h2
    float: left
  div
    float: right
    width: 50%
    height: 100%
    padding-top: 14px;
    i
      float: right

</style>
