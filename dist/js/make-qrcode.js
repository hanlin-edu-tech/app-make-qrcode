(function () {
  let url = window.location.search
  let ehanlinHost = `https://www.tbbt.com.tw/event/collection/?`
  let year = url.split('&')[0].split('=')[1]
  let type = url.split('&')[1].split('=')[1]
  let htmlType = decodeURI(type)
  let subject = url.split('&')[2].split('=')[1]
  let typeIdx = url.split('&')[3].split('=')[1]
  let dataCode
  let idx = typeIdx

  for (let index = 1; index <= idx; index++) {
    $('#qrcode').append(
      `
      <div id="qrcode${index}">
        <div data-title="${type}科目${subject}第${index}題">${htmlType} 第${index}題 科目${subject}</div>
        <a id="downloadLink"></a>
        <button type="button">下载</button>
      </div>
      <hr>
      `
    )
    dataCode = {
      text: `${ehanlinHost}year=${year}&type=${type}&subject=${subject}#1_${index}`,
      width: 128,
      height: 128,
      colorDark: '#000000',
      colorLight: '#ffffff',
      correctLevel: QRCode.CorrectLevel.H
    }
    let qrcode = new QRCode(document.getElementById(`qrcode${index}`), dataCode)
  }

  let downloadClick = (index, qrcodeName) => {
    let img = document.getElementById('qrcode').getElementsByTagName('img')[index - 1]
    let canvas = document.createElement('canvas')

    canvas.width = img.width
    canvas.height = img.height
    canvas.getContext('2d').drawImage(img, 0, 0)

    let url = canvas.toDataURL('image/jpg')
    let downloadLink = document.getElementById('downloadLink')

    downloadLink.setAttribute('href', url)
    downloadLink.setAttribute('download', `${qrcodeName}.jpg`)
    downloadLink.click()
  }

  for (let index = 1; index <= idx; index++) {
    $(`#qrcode${index} button`).on('click', () => {
      console.log(index)
      let qrcodeName = $(`#qrcode${index} div`).attr('data-title')
      let typeName = decodeURI(qrcodeName)

      console.log(qrcodeName)
      downloadClick(index, typeName)
    })
  }
})()
