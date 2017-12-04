<template>
<el-row>
  <el-col :span="16">
    <div style="width: 100%; min-height: 1px">
      <el-card v-for="(project, i) in filtered_projects" :key="i">
        <el-container>
          <el-header>{{ project.title }}</el-header>
          <el-main>
            <div class="project-content">
              <iframe v-if="project.intro_type === 'youtube'" width="560" height="315" :src="project.intro_content" frameborder="0" allowfullscreen></iframe>
              <p v-if="project.intro_type === 'text'">{{ project.intro_content }}</p>
              <p v-if="project.intro_type === 'coming_soon'" class="intro-large">{{ project.intro_content }}</p>
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
import { uniq, flatten, intersection } from 'lodash'

export default {
  data() {
    return {
      opened_filters: [],
      applied_filters: {
        has_video_project: '',
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
          tech_tags: ['AWS EB', 'AWS SQS', 'AWS S3', 'AWS Lambda', 'AWS SimpleWorkflow', 'Aliyun', 'AWS VPC', 'JWT', 'AWS ECS', 'Docker', 'Vagrant'],
          type: 'danger',
        },
        'Backend Framework & Database': {
          tech_tags: ['Django', 'NodeJS', 'Swagger', 'SQL Server', 'Postgres', 'Knex', 'Sequelize', 'Bookshelf'],
          type: 'default',
        },
        'Frontend': {
          tech_tags: ['VueJS', 'ReactJS', 'GraphQL', 'Sass', 'Webpack'],
          type: 'warning',
        },
        'Data Manipulation': {
          tech_tags: ['Pandas', 'Scrapy'],
          type: 'success',
        },
      },
      projects: [{
        title: 'Fred: Distributed Crawling and Data Ingestion Tool',
        tech_tags: ['AWS EB', 'AWS SQS', 'AWS ECS', 'AWS S3', 'AWS VPC', 'SQL Server', 'Postgres', 'Django', 'VueJS', 'Docker'],
        intro_content: '(Video demo Ready By 2017/12/15)',
        intro_type: 'coming_soon',
        company: 'Myers Media Group LLC',
        roles: ['Solo'],
        supervised_by_architech: true,
        percentage_feature_responsible: 100,
        percentage_code_contribution: 100,
        active_start: '2017/05',
        active_end: '2017/12',
        current_maintainer: true,
        funded: true,
        updated: '2017/12/03',
      }, {
        title: 'Rainbow: Multi-source, Multi-destination ETL Tool',
        tech_tags: ['AWS Lambda', 'AWS SimpleWorkflow', 'Docker', 'Vagrant', 'Pandas', 'Django', 'Scrapy', 'Postgres'],
        intro_content: '(Video demo Ready By 2017/12/15)',
        intro_type: 'coming_soon',
        company: 'Myers Media Group LLC',
        roles: ['Solo'],
        supervised_by_architech: true,
        percentage_feature_responsible: 98,
        percentage_code_contribution: 95,
        active_start: '2016/08',
        active_end: '2017/02',
        current_maintainer: true,
        funded: true,
        updated: '2017/12/03',
      }, {
        title: 'SIC: Internal Website for Sales Management & Data Visualization',
        tech_tags: ['ReactJS', 'GraphQL', 'Docker', 'NodeJS', 'Knex', 'Sequelize', 'Swagger', 'Bookshelf', 'JWT', 'Postgres'],
        intro_content: null,
        intro_type: 'text',
        company: 'Myers Media Group LLC',
        roles: ['Associate'],
        supervised_by_architech: true,
        percentage_feature_responsible: 10,
        percentage_code_contribution: 10,
        active_start: '2016/09',
        active_end: '2017/01',
        current_maintainer: true,
        funded: true,
        updated: '2017/12/03',
      }, {
        title: 'AI Book: Interactive Textbook with Modulized Content',
        tech_tags: ['VueJS', 'Sass', 'Docker', 'Swagger', 'NodeJS', 'Sequelize', 'Postgres'],
        intro_content: null,
        intro_type: 'text',
        company: 'AI Master Inc.',
        roles: ['Technical Director'],
        supervised_by_architech: false,
        percentage_feature_responsible: 50,
        percentage_code_contribution: 40,
        active_start: '2017/06',
        active_end: '2017/09',
        current_maintainer: true,
        funded: true,
        updated: '2017/12/03',
      }, {
        title: 'AI Master Website: Pure Blood SPA',
        tech_tags: ['VueJS', 'Webpack', 'Sass', 'Docker', 'Swagger', 'NodeJS', 'Sequelize', 'Postgres', 'JWT', 'AWS S3', 'Aliyun'],
        intro_content: null,
        intro_type: 'text',
        company: 'AI Master Inc.',
        roles: ['Associate', 'Technical Director'],
        supervised_by_architech: false,
        percentage_feature_responsible: 90,
        percentage_code_contribution: 25,
        active_start: '2017/03',
        active_end: '2017/09',
        current_maintainer: true,
        funded: true,
        updated: '2017/12/03',
      }, {
        title: 'AI Book Content Editor: Tree Structure Content Editor',
        tech_tags: ['VueJS', 'Docker', 'Swagger', 'NodeJS', 'Sequelize', 'Postgres'],
        intro_content: 'https://www.youtube.com/embed/wzi2jkKGuhw',
        intro_type: 'youtube',
        company: 'AI Master Inc.',
        roles: ['Solo'],
        supervised_by_architech: false,
        percentage_feature_responsible: 100,
        percentage_code_contribution: 100,
        active_start: '2017/07',
        active_end: '2017/08',
        current_maintainer: true,
        funded: true,
        updated: '2017/12/03',
      }],
    }
  },
  computed: {
    filter_items() {
      return [{
        type: 'select',
        multiple: false,
        name: 'has_video_project',
        human_readable: 'Has Video project',
        options: [
          { label: 'Yes', value: true },
          { label: 'No', value: false },
        ],
        filter_function: project => {
          return this.applied_filters.has_video_project === (project.intro_type === 'youtube')
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
}
.intro-large {
  font-size: 30px;
  font-weight: 100;
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
</style>
