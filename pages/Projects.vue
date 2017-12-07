<template>
<el-row>
  <el-col :span="16">
    <div style="width: 100%; min-height: 1px">
      <el-button type="danger" @click="show_timeline = !show_timeline">{{ `${show_timeline ? 'Hide' : 'Show'}` }} Timeline</el-button>
      <br/><br/>
      <el-card v-show="show_timeline">
        <div ref="timeline"></div>
      </el-card>
      <el-card v-for="(project, i) in filtered_projects" :key="i" :id="project.name">
        <el-container>
          <el-header>{{ project.human_name }}: {{ project.short_desc }}</el-header>
          <el-main>
            <div class="project-content">
              <p class="desc">{{ project.desc }}</p>
              <div v-if="project.intro_type === 'youtube'">
                <iframe width="560" height="315" :src="project.intro_content" frameborder="0" allowfullscreen></iframe>
              </div>
              <div v-else-if="project.intro_type === 'text'">
                <div v-html="project.intro_content" class="intro-small"></div>
              </div>
              <div v-else-if="project.intro_type === 'intro_large'">
                <div v-html="project.intro_content" class="intro-large"></div>
              </div>
            </div>
          </el-main>
          <el-footer>
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
            <div><el-tag v-for="(tag, j) in project.tech_tags" :key="j" :type="tech_to_type ? tech_to_type[tag] : 'info'" class="project-tag">{{ tag }}</el-tag></div>
          </el-footer>
        </el-container>
      </el-card>
    </div>
  </el-col>
  <el-col :span="8">
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
  </el-col>
</el-row>
</template>

<script>
import projects from '~/helpers/projects'
import { uniq, flatten, intersection } from 'lodash'

export default {
  mounted: function() {
    const timeline_items = projects.map((project, id) => {
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
  },
  data() {
    return {
      show_timeline: false,
      opened_filters: [],
      applied_filters: {
        has_video_demo: '',
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
          type: 'danger',
        },
        'Backend Framework & Database': {
          tech_tags: ['Django', 'NodeJS', 'Swagger', 'SQL Server', 'Postgres', 'Knex', 'Sequelize', 'Bookshelf', 'MongoDB', 'Ruby on Rails', 'ActiveRecord'],
          type: 'default',
        },
        'Frontend': {
          tech_tags: ['VueJS', 'ReactJS', 'GraphQL', 'Sass', 'Webpack', 'MeteorJS', 'Framework7', 'Selenium', 'AngularJS', 'JsPsych'],
          type: 'warning',
        },
        'Data Manipulation': {
          tech_tags: ['Pandas', 'Scrapy', 'Amazon Mechanical Turk', 'Numpy', 'Matlab'],
          type: 'success',
        },
        'Language': {
          tech_tags: ['Python', 'Bash', 'Javascript', 'php'],
          type: 'info',
        }
      },
      projects,
    }
  },
  computed: {
    filter_items() {
      return [{
        type: 'switch',
        multiple: false,
        name: 'has_video_demo',
        human_readable: 'Has Video Demo',
        filter_function: project => {
          return this.applied_filters.has_video_demo === (project.intro_type === 'youtube')
        },
      }, {
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
        options: this.all_roles ? this.all_roles : [],
        filter_function: project => {
          return intersection(project.roles, this.applied_filters.roles).length > 0
        },
      }, {
        type: 'switch',
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

<style scoped>
.project-tag {
  margin-right: 0.3rem;
}
.el-footer {
  height: auto !important;
  line-height: 1.5rem;
  color: #9E9E9E;
  font-size: 0.9rem;
}
.el-header {
  font-size: x-large;
  font-weight: bold;
  line-height: 60px;
  height: auto !important;
}
.intro-large {
  font-size: 30px;
  font-weight: 100;
}
.intro-small {

}
.desc {
  font-weight: 100;
  font-style: italic;
  margin-bottom: 2rem;
}
.el-input__inner {
  width: auto !important;
}
.el-select {
  width: 100%;
}
.el-slider {
  width: 90%;
  margin: auto;
}
.timeline-item {
  font-size: 14px;
}
</style>
