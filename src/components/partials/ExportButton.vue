<template>
  <v-menu
    rounded
    offset-y
  >
    <template v-slot:activator="{ attrs, on }">
      <v-btn
        v-bind="attrs"
        class="text-none"
        v-on="on"
      >
        Export
        <v-icon
          right
        >
          {{ icons.mdiFileExport }}
        </v-icon>
      </v-btn>
    </template>

    <v-list>
      <v-list-item
        key="pdf"
        link
        @click="exportData('pdf')"
      >
        <v-list-item-title>
          <v-icon
            left
            size="22"
          >
            {{ icons.mdiFilePdf }}
          </v-icon>Pdf
        </v-list-item-title>
      </v-list-item>
      <v-list-item
        key="excel"
        link
        @click="exportData('excel')"
      >
        <v-list-item-title>
          <v-icon
            left
            size="22"
          >
            {{ icons.mdiFileExcel }}
          </v-icon>Excel
        </v-list-item-title>
      </v-list-item>
    </v-list>
  </v-menu>
</template>

<script>
import axios from 'axios'
import moment from 'moment'
import * as XLSX from 'xlsx'
import {
  mdiFilePdf, mdiFileExcel, mdiFileExport,
} from '@mdi/js'
import JsPDF from 'jspdf'

import AutoTable from 'jspdf-autotable'

export default {
  props: {
    headers: {
      type: Array,
      default: null,

    },
    dataEndpoint: {
      type: String,
      default: null,

    },
    title: {
      type: String,
      default: null,

    },
    subTitle: {
      type: String,
      default: null,

    },
    orientation: {
      type: String,
      default: 'portrait',
    },
  },
  data() {
    return {
      icons: {
        mdiFilePdf,
        mdiFileExcel,
        mdiFileExport,
      },
      data: [],

    }
  },
  computed: {
    formattedTitle() {
      return this.title.toLowerCase().replace(/(^|\s)\w/g, match => match.toUpperCase())
    },
  },
  methods: {
    exportData(exportType) {
      this.$toast.success('Download will start shortly')
      this.fetchApiData(exportType)
    },
    fetchApiData(exportType) {
      const url = this.replacePerPageWithAll(this.dataEndpoint)
      axios
        .get(url)
        .then(response => {
          this.data = response.data
          if (this.data.length === 0) {
            this.$toast.error('Can not export from an empty table.')

            return
          }
          if (exportType === 'pdf') {
            this.generatePdf()
          } else {
            this.generateXls()
          }
        })
        .catch(error => {
          console.log(error)
          this.$toast.error('Something went wrong while exporting')
        })
    },
    generatePdf() {
      const doc = new JsPDF(this.orientation, 'pt')
      const totalPagesExp = '{total_pages_count_string}'
      let startY = 80

      doc.text(this.formattedTitle, doc.internal.pageSize.getWidth() / 2, 50, { align: 'center' })

      if (this.subTitle) {
        startY = 100
        doc.text(this.subTitle, doc.internal.pageSize.getWidth() / 2, 80, { align: 'center' })
      }
      const position = this.orientation === 'landscape' ? 800 : 550

      const exportData = this.data.map(item => {
        const exportedItem = {}
        this.headers.forEach(header => {
          const value = header.value.split('.').reduce((obj, prop) => obj && obj[prop], item)
          exportedItem[header.text] = value
        })

        return exportedItem
      })

      AutoTable(doc, {
        startY,
        body: exportData,
        columns: this.headers.map(header => ({
          header: header.text,
          dataKey: header.text,
        })),
        didDrawPage(data) {
          let str = `Page ${doc.internal.getNumberOfPages()}`

          if (typeof doc.putTotalPages === 'function') {
            str = `${str} of ${totalPagesExp}`
          }
          doc.setFontSize(10)

          const { pageSize } = doc.internal
          const pageHeight = pageSize.height ? pageSize.height : pageSize.getHeight()
          doc.text(str, data.settings.margin.left, pageHeight - 10)
          const currentDate = moment().format('DD/MM/YYYY hh:mm')
          doc.text(currentDate, position, pageHeight - 10, 'right')
        },
      })

      // Total page number plugin only available in jspdf v1.0+
      if (typeof doc.putTotalPages === 'function') {
        doc.putTotalPages(totalPagesExp)
      }

      doc.save(`${this.formattedTitle}.pdf`)
    },
    generateXls() {
      const exportData = this.data.map(item => {
        const exportedItem = {}
        this.headers.forEach(header => {
          const value = header.value.split('.').reduce((obj, prop) => obj && obj[prop], item)
          exportedItem[header.text] = value
        })

        return exportedItem
      })

      const worksheet = XLSX.utils.json_to_sheet(exportData)
      const workbook = XLSX.utils.book_new()
      XLSX.utils.book_append_sheet(workbook, worksheet, 'data')

      XLSX.writeFile(workbook, `${this.formattedTitle}.xlsx`)
    },
    replacePerPageWithAll(query) {
      // Get the perPage param value.
      const match = /&perPage=([0-9]+)/.exec(query)
      const perPage = match ? match[1] : null

      // Replace the perPage param value with 'all'.
      const newQuery = query.replace(/&perPage=([0-9]+)/, '&perPage=all')

      // Return the new query string.
      return newQuery
    },
  },
}
</script>
