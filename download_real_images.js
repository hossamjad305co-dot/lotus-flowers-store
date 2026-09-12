const https = require('https');
const fs = require('fs');
const path = require('path');

const targetDir = path.join(__dirname, 'assets', 'products');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const items = [
  {
    name: 'logo.jpg',
    dir: path.join(__dirname, 'assets'),
    url: 'https://scontent.cdninstagram.com/v/t51.82787-19/541623119_18046091198647799_6626265400479205845_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_cat=105&ccb=7-5&_nc_sid=f7ccc5&efg=eyJ2ZW5jb2RlX3RhZyI6InByb2ZpbGVfcGljLnd3dy42MDAuQzMifQ%3D%3D&_nc_ohc=nPzQ50B2z50Q7kNvwGd76Nq&_nc_oc=Adp58dPIKtVy97222sfXqCkIjTh4CjcSLhqhaL2tv_SzaXJaCVr_eaXK0gcGd0bSr0s&_nc_zt=24&_nc_ht=scontent.cdninstagram.com&_nc_gid=jw_xPDU-lQVPzLjJ06HD6g&_nc_ss=7ea02&oh=00_AQKEEEpbwE9fZDw6xTfZYRbxxRtQcv8nzij3zNNEftLW8A&oe=6AAB5AC3'
  },
  {
    name: 'p01.jpg',
    dir: targetDir,
    url: 'https://scontent.cdninstagram.com/v/t39.30808-6/800950412_122144804889001164_4933450448316178368_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=104&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=ZnNGb77MaIsQ7kNvwHW1r4d&_nc_oc=Ado69xrCXb-JFcgywQZF8U30i5m62zETMAsLSVvU9_xFx8VhChcwdimQue1gJEth-gY&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=ysnqRTKllHuJbR1oqfivJA&_nc_ss=7ea02&oh=00_AQJHTdDMN2KNiSzYRzilRyDV_eCP6VoBjB4KxZ69tjvT4w&oe=6AAB592D'
  },
  {
    name: 'p02.jpg',
    dir: targetDir,
    url: 'https://scontent.cdninstagram.com/v/t39.30808-6/799591594_122144803599001164_967251619173730395_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=107&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=3um7Xl0HxlwQ7kNvwEdspZi&_nc_oc=Adp3trq_ZO2sHG_JqNfpeOgBPOs1NBrCyaPE0SNp9dqVAHOS0UqkzOKGFT7LAfX27J4&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=ysnqRTKllHuJbR1oqfivJA&_nc_ss=7ea02&oh=00_AQK5KbwiNU-tLm-v-eOlMr4iGNl9dnLG70kkaWYimZdJLQ&oe=6AAB5868'
  },
  {
    name: 'p03.jpg',
    dir: targetDir,
    url: 'https://scontent.cdninstagram.com/v/t39.30808-6/800925094_122144803029001164_5051061355405889891_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=104&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=esy_CXiYR3YQ7kNvwFwmZyl&_nc_oc=Adp1j_W_Byws1ATUw-LBKGzbj03HtyYa-lXVcSt2Pni5RUwsARS4fO78RQXeMkaaxMk&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=ysnqRTKllHuJbR1oqfivJA&_nc_ss=7ea02&oh=00_AQI4pA14zKLUoYQO4k0btUY0zGuaU2C6YOK5hvMuCskhDQ&oe=6AAB5677'
  },
  {
    name: 'p04.jpg',
    dir: targetDir,
    url: 'https://scontent.cdninstagram.com/v/t39.30808-6/799527723_122144802777001164_4150672196024320268_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=110&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=kZf7MrHB10wQ7kNvwHgbWO-&_nc_oc=Ado-ypsLtf50nxynTH09UuMMcwuj_uMW_OimDLWJjzVjMX_BGUvNEA637ZdSJQyo8Mo&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=ysnqRTKllHuJbR1oqfivJA&_nc_ss=7ea02&oh=00_AQKKY5yNObgLzDL2HmlUljcYaGpULnnudrKSTFf36TDqVA&oe=6AAB620D'
  },
  {
    name: 'p05.jpg',
    dir: targetDir,
    url: 'https://scontent.cdninstagram.com/v/t39.30808-6/799676851_122144802051001164_9195626082980358097_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=111&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=oudzgH_NUtQQ7kNvwE5Jcim&_nc_oc=AdoznWwD9RqWz-PUnCal29bAoPiiAAJD4toprxKY91iX_jO1p3yE9KmUWFR79BEhYzk&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=ysnqRTKllHuJbR1oqfivJA&_nc_ss=7ea02&oh=00_AQIA0ndOqz7ZYmWvt0B7qfN0gI0dKpIHUVv0LG_8nWMKLw&oe=6AAB7331'
  },
  {
    name: 'p06.jpg',
    dir: targetDir,
    url: 'https://scontent.cdninstagram.com/v/t39.30808-6/799591591_122144801565001164_7401392479980483448_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=106&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=IDVdr7k9OIgQ7kNvwFRLjmi&_nc_oc=AdqaNRyBiTV0gwZii9TooS6hI9lYXR2s3LFKPVq4mGXyQh_Cxj82FnWI-XO2AtY7ct4&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=ysnqRTKllHuJbR1oqfivJA&_nc_ss=7ea02&oh=00_AQKtpjZNnjv5K3b3MmeRJk_eagvPJcMo8QdEju1WfmP0Ww&oe=6AAB4C65'
  },
  {
    name: 'p07.jpg',
    dir: targetDir,
    url: 'https://scontent.cdninstagram.com/v/t39.30808-6/801045633_122144801289001164_7734603279080807925_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=108&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=Q2FDyV053w4Q7kNvwG5lzl9&_nc_oc=AdrEKZcAZwGkOU_0x5yzz8_wmtGXOJH4AGujXh-mpbRki7sPd6GbB8EFRW3dw0-OjwQ&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=ysnqRTKllHuJbR1oqfivJA&_nc_ss=7ea02&oh=00_AQKunpRbpiiWFJsXpPMIqZVob9tQnvWqWEOJiE3yK2sA1w&oe=6AAB680D'
  },
  {
    name: 'p08.jpg',
    dir: targetDir,
    url: 'https://scontent.cdninstagram.com/v/t39.30808-6/800034924_122144800911001164_1561941045004306253_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=100&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiRkVFRC5iZXN0X2ltYWdlX3VybGdlbi5DMyJ9&_nc_ohc=b2QRhkfrq1EQ7kNvwGZH055&_nc_oc=Ado4jhe3jo0cXxp_vD6lYAfmqq9ztnQ2qrG0v-gNiqI1SBXre75G2f9O-p1KRod5ndk&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=ysnqRTKllHuJbR1oqfivJA&_nc_ss=7ea02&oh=00_AQLmbBuw_K8aoJnIQ93Z52GCTcgr0GFQvpINnNsYY_ezvQ&oe=6AAB45F2'
  },
  {
    name: 'p09.jpg',
    dir: targetDir,
    url: 'https://scontent.cdninstagram.com/v/t51.82787-15/778852722_18089036672647799_1450191416232785463_n.jpg?stp=dst-jpg_e35_s640x640_tt6&_nc_cat=105&ccb=7-5&_nc_sid=18de74&efg=eyJlZmdfdGFnIjoiQ0xJUFMuYmVzdF9pbWFnZV91cmxnZW4uQzMifQ%3D%3D&_nc_ohc=InR-qNKFHJAQ7kNvwH4C5KX&_nc_oc=AdpLk9H1-OA4F2Mv8XW8GXmkjqQntNaXJd0lV9fulmxMhnFVwH49bPEsMxbB66Z3AVw&_nc_zt=23&_nc_ht=scontent.cdninstagram.com&_nc_gid=ysnqRTKllHuJbR1oqfivJA&_nc_ss=7ea02&oh=00_AQL9-nNZWk3O72KNhGNjirFTPvNROQykLmsbh26vewoP0A&oe=6AAB5654'
  }
];

function downloadFile(item) {
  return new Promise((resolve) => {
    const dest = path.join(item.dir, item.name);
    const file = fs.createWriteStream(dest);
    https.get(item.url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close(() => {
          console.log(`Saved ${item.name} (${fs.statSync(dest).size} bytes)`);
          resolve();
        });
      });
    }).on('error', (err) => {
      console.error(`Error downloading ${item.name}:`, err.message);
      resolve();
    });
  });
}

(async () => {
  for (const it of items) {
    await downloadFile(it);
  }
  console.log('All real Instagram images downloaded successfully!');
})();
