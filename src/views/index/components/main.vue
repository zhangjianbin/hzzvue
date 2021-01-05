<template>
  <div v-loading.fullscreen.lock="fullscreenLoading" class="container">
    <div class="label">您想要分析的知识:</div>
    <div class="filterBox zy_border">
      <el-form ref="form" :model="filter" label-width="80px" class="form">
        <el-form-item label="教学知识">
          <el-select v-model="filter.teaching" placeholder="请选择">
            <el-option label="案例教学法" value="案例教学法" />
          </el-select>
        </el-form-item>
        <el-form-item label="技术知识">
          <el-select v-model="filter.technology" placeholder="请选择">
            <el-option label="Scratch" value="Scratch" />
            <el-option label="Python" value="Python" />
            <el-option label="视频" value="视频" />
            <el-option label="动画" value="动画" />
          </el-select>
        </el-form-item>
        <el-form-item label="内容知识">
          <el-select v-model="filter.content" placeholder="请选择">
            <el-option label="循环语句" value="循环语句" />
          </el-select>
        </el-form-item>
      </el-form>
    </div>
    <div class="label">请上传您的教案:</div>
    <div class="uploadBtns">
      <el-upload
        ref="upload"
        class="upload-local"
        drag
        action="http://118.89.240.201/upload/upload-file"
        :data="{
          uploadSubPath: 'excel',
          token: '654321'
        }"
        :multiple="false"
        :auto-upload="true"
        accept=".xlsx"
        :on-success="uploadSuccess"
        :on-error="uploadFail"
      >
        <i class="el-icon-upload" />
        <div class="el-upload__text">将文件拖到此处，或<em>点击上传</em>EXCEL</div>
        <div slot="tip" class="el-upload__tip">！提示：请按照我们提供的模板创建您的教案，否则系统将无法完成解析。</div>
      </el-upload>
    </div>
    <div class="label">概要分析:</div>
    <div class="contentBox">
      <div class="resultTxt">您一共设计了XX个教学活动，其中涵盖技术教学内容知识（TPACK）的活动有XX个，涵盖技术教学内容知识（TPK）
        的活动有XX个，涵盖教学内容知识（PAK）的活动有XX个，涵盖技术内容知识（TCK）的活动有XX个，只包含单一
        维度知识的活动有XX个。
      </div>
    </div>
    <div class="label">详细结果:</div>
    <div ref="result" class="result" contenteditable v-html="resultHtml" />

    <div class="submit">
      <el-button type="primary" @click="exportExcel">保存</el-button>
      <span class="tips">您可以直接编辑上面的表格，编辑后点击保存即可导出excel文件</span>
    </div>

  </div>
</template>

<script>
import XLSX from 'xlsx'
import $ from 'jquery'
import { transformAliyun } from '@/api/index'
export default {
  data() {
    return {
      filter: {
        teaching: '案例教学法',
        technology: '',
        content: '循环语句'
      },
      resultHtml: '',
      fullscreenLoading: false
    }
  },
  methods: {
    uploadSuccess(response, file) {
      const that = this
      this.$message({
        message: '上传成功',
        type: 'success'
      })

      that.readWorkbookFromLocalFile(file.raw, function(workbook) {
        that.readWorkbook(workbook)
      })
    },
    uploadFail() {
      this.$message({
        message: '上传失败',
        type: 'error'
      })
    },
    readWorkbookFromLocalFile(file, callback) {
      var reader = new FileReader()
      reader.onload = function(e) {
        var data = e.target.result
        var workbook = XLSX.read(data, { type: 'binary' })
        if (callback) callback(workbook)
      }
      reader.readAsBinaryString(file)
    },
    readWorkbook(workbook) {
      const that = this
      const sheetNames = workbook.SheetNames // 工作表名称集合
      const worksheet = workbook.Sheets[sheetNames[0]] // 这里我们只读取第一张sheet

      const csv = XLSX.utils.sheet_to_csv(worksheet)
      const rows = csv.split('\n')
      const pms = []

      this.fullscreenLoading = true

      rows.forEach(function(row, ids) {
        if (row.length > 0) {
          pms.push(that.getResult(row))
        }
      })

      Promise.all(pms).then(function(results) {
        var re = results.join('')
        that.resultHtml = that.csv2table(re)
      }).finally(() => {
        this.fullscreenLoading = false
      })
    },
    getResult(contents) {
      const accesskey = 'jJa0gLGMskjszKnrykQwtCvuEcx5GU'
      const signatureNonce = this.generateUUID()
      var timeStr = new Date().toISOString()
      var params = {
        AccessKeyId: 'LTAI4G9XfMM3km7cP52v6bwS',
        Action: 'GetPredictResult',
        Content: contents,
        Format: 'JSON',
        ModelId: 6619,
        ModelVersion: 'V1',
        SignatureMethod: 'HMAC-SHA1',
        SignatureNonce: signatureNonce,
        SignatureVersion: '1.0',
        Timestamp: timeStr,
        Version: '2019-11-11'
      }
      const signature = this.getSignature(params, accesskey)
      params.Signature = signature

      var pm = new Promise(function(resolve, reject) {
        transformAliyun(params).then(data => {
          var res = data.Content
          var dd = contents + ',' + res.replace(/,/gi, '')
          dd += '\n'
          resolve(dd)
        })
      })
      return pm
    },
    generateUUID() {
      var d = new Date().getTime()
      if (window.performance && typeof window.performance.now === 'function') {
        d += performance.now() // use high-precision timer if available
      }
      var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = (d + Math.random() * 16) % 16 | 0
        d = Math.floor(d / 16)
        return (c == 'x' ? r : (r & 0x3 | 0x8)).toString(16)
      })
      return uuid
    },
    getSignature(params, accessKeySecret) {
      var queryParams = []
      var canonicalizedQueryString
      var oa = Object.keys(params).sort()
      for (var i = 0; i < oa.length; i++) {
        var key = oa[i]
        queryParams.push(this.percentEncode(key) + '=' + this.percentEncode(params[key]))
      }
      canonicalizedQueryString = queryParams.join('&')
      var stringToSign = 'POST' + '&' + this.percentEncode('/') + '&' + this.percentEncode(canonicalizedQueryString)

      accessKeySecret = accessKeySecret + '&'
      var bytes = Crypto.HMAC(Crypto.SHA1, stringToSign, accessKeySecret, { asBytes: true })
      var signature = Crypto.util.bytesToBase64(bytes)
      return signature
    },

    percentEncode(value) {
      var encoded = encodeURIComponent(value)
      return encoded.replace(/!/g, '%21').replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29').replace(/\*/g, '%2A')
    },
    csv2table(csv) {
      var html = '<table class="result_table">'
      var rows = csv.split('\n')
      rows.pop() // 最后一行没用的
      rows.forEach(function(row, idx) {
        var columns = row.split(',')
        columns.unshift(idx + 1) // 添加行索引
        if (idx == 0) { // 添加列索引
          html += '<tr>'
          for (var i = 0; i < columns.length; i++) {
            html += '<th class="result_border">' + (i == 0 ? '' : String.fromCharCode(65 + i - 1)) + '</th>'
          }
          html += '</tr>'
        }
        html += '<tr>'
        columns.forEach(function(column) {
          html += '<td class="result_border">' + column + '</td>'
        })
        html += '</tr>'
      })
      html += '</table>'
      return html
    },
    table2csv(table) {
      var csv = []
      $(table).find('tr').each(function() {
        var temp = []
        $(this).find('td').each(function() {
          temp.push($(this).html())
        })
        temp.shift() // 移除第一个
        csv.push(temp.join(','))
      })
      csv.shift()
      return csv.join('\n')
    },
    csv2sheet(csv) {
      var sheet = {} // 将要生成的sheet
      csv = csv.split('\n')
      csv.forEach(function(row, i) {
        row = row.split(',')
        if (i == 0) sheet['!ref'] = 'A1:' + String.fromCharCode(65 + row.length - 1) + (csv.length)
        row.forEach(function(col, j) {
          sheet[String.fromCharCode(65 + j) + (i + 1)] = { v: col }
        })
      })
      return sheet
    },
    sheet2blob(sheet, sheetName) {
      sheetName = sheetName || 'sheet1'
      var workbook = {
        SheetNames: [sheetName],
        Sheets: {}
      }
      workbook.Sheets[sheetName] = sheet
      // 生成excel的配置项
      var wopts = {
        bookType: 'xlsx', // 要生成的文件类型
        bookSST: false, // 是否生成Shared String Table，官方解释是，如果开启生成速度会下降，但在低版本IOS设备上有更好的兼容性
        type: 'binary'
      }
      var wbout = XLSX.write(workbook, wopts)
      var blob = new Blob([s2ab(wbout)], { type: 'application/octet-stream' })
      // 字符串转ArrayBuffer
      function s2ab(s) {
        var buf = new ArrayBuffer(s.length)
        var view = new Uint8Array(buf)
        for (var i = 0; i != s.length; ++i) view[i] = s.charCodeAt(i) & 0xFF
        return buf
      }
      return blob
    },
    openDownloadDialog(url, saveName) {
      if (typeof url === 'object' && url instanceof Blob) {
        url = URL.createObjectURL(url) // 创建blob地址
      }
      var aLink = document.createElement('a')
      aLink.href = url
      aLink.download = saveName || '' // HTML5新增的属性，指定保存文件名，可以不要后缀，注意，file:///模式下不会生效
      var event
      if (window.MouseEvent) event = new MouseEvent('click')
      else {
        event = document.createEvent('MouseEvents')
        event.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
      }
      aLink.dispatchEvent(event)
    },
    exportExcel() {
      var csv = this.table2csv(this.$refs['result'])
      var sheet = this.csv2sheet(csv)
      var blob = this.sheet2blob(sheet)
      this.openDownloadDialog(blob, '导出.xlsx')
    }
  }
}
</script>

<style lang="scss" scoped>
.container{
  width: 100%;
  min-height: calc(100vh - 160px);
  padding:10px 20px;
  .zy_border{
     border: 1px solid #ccc {
      top: 0px;
      bottom: 0px;
    }
  }
  .contentBox{
    padding:10px;
  }
  .label{
    $labelHeight:50px;
    font-size:16px;
    line-height: $labelHeight;
    height: $labelHeight;
    background-color: #3a95fd;
    color: #fff;
    padding-left: 20px;
  }
  .filterBox{
    padding:10px 0;
    .form{
      width: 100%;
      display:flex;
      justify-content: space-around;
      align-items: center;
    }
  }
  .upload-local{
    width: 360px;
    margin:10px auto;
  }
  .result{
    min-height: 200px;
  }
  .resultTxt{
    min-height: 80px;
    font-size:16px;
    color: #000;;
  }
  .submit{
    .tips{
      font-size: 12px;
      color: rgb(83, 82, 82);
    }
  }
}
</style>
<style>
  .result_table{
    border-collapse: collapse;
  }
  .result_border{
    border: solid 1px #6D6D6D;
    padding: 5px 10px;
  }

</style>
