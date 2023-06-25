'use strict'
const bcrypt = require('bcryptjs')
const saltRounds = 10
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [
      {
        provider: 'native',
        email: 't1@seed.com',
        password: await bcrypt.hash('t1', saltRounds),
        name: 'Bleacher Report NBA',
        avatar:
          'https://pbs.twimg.com/profile_images/1266053203616989186/ozSULDRt_400x400.jpg',
        cover:
          'https://pbs.twimg.com/profile_banners/36724576/1493213775/1080x360',
        bio: 'Top NBA news, columns, video and opinion from http://BleacherReport.com',
      },
      {
        provider: 'native',
        email: 't2@seed.com',
        password: await bcrypt.hash('t2', saltRounds),
        name: 'SHAQ',
        avatar:
          'https://pbs.twimg.com/profile_images/1579949436527988737/RDqn1udJ_400x400.jpg',
        cover:
          'https://pbs.twimg.com/profile_banners/17461978/1665524734/1080x360',
        bio: 'VERY QUOTATIOUS, I PERFORM RANDOM ACTS OF SHAQNESS',
      },
      {
        provider: 'native',
        email: 't3@seed.com',
        password: await bcrypt.hash('t3', saltRounds),
        name: 'Stephen Curry',
        avatar:
          'https://pbs.twimg.com/profile_images/1542667356949819392/IyRCxMgo_400x400.jpg',
        cover:
          'https://pbs.twimg.com/profile_banners/42562446/1678229624/1080x360',
        bio: 'Warriors guard. Davidson Wildcat. BAYC. Philippians 4:13 ',
      },
      {
        provider: 'native',
        email: 't4@seed.com',
        password: await bcrypt.hash('t4', saltRounds),
        name: 'LeBron James',
        avatar:
          'https://pbs.twimg.com/profile_images/1421530540063092736/xqtcu8HX_400x400.jpg',
        cover:
          'https://pbs.twimg.com/profile_banners/23083404/1529843462/1080x360',
        bio: 'EST. AKRON - ST.V/M Class of 03',
      },
      {
        provider: 'native',
        email: 't5@seed.com',
        password: await bcrypt.hash('t5', saltRounds),
        name: 'Trae Young',
        avatar:
          'https://pbs.twimg.com/profile_images/1225597479711858688/-G9orx5h_400x400.jpg',
        cover:
          'https://pbs.twimg.com/profile_banners/2842841126/1609304009/1080x360',
        bio: 'Trae Young 3’s OTW 👀! 👟',
      },
      {
        provider: 'native',
        email: 't6@seed.com',
        password: await bcrypt.hash('t6', saltRounds),
        name: 'Atlanta Hawks',
        avatar:
          'https://pbs.twimg.com/profile_images/1642782600618991616/TovAAzTb_400x400.jpg',
        cover:
          'https://pbs.twimg.com/profile_banners/17292143/1682650946/1080x360',
        bio: 'We are always #TrueToAtlanta',
      },
      {
        provider: 'native',
        email: 't7@seed.com',
        password: await bcrypt.hash('t7', saltRounds),
        name: 'NASA',
        avatar:
          'https://pbs.twimg.com/profile_images/1321163587679784960/0ZxKlEKB_400x400.jpg',
        cover:
          'https://pbs.twimg.com/profile_banners/11348282/1686258645/1080x360',
        bio: 'There is space for everybody. ✨',
      },
      {
        provider: 'native',
        email: 't8@seed.com',
        password: await bcrypt.hash('t8', saltRounds),
        name: 'Taylor Swift',
        avatar:
          'https://pbs.twimg.com/profile_images/1564101520043479043/eJpWqka2_400x400.jpg',
        cover:
          'https://pbs.twimg.com/profile_banners/17919972/1666325927/1080x360',
        bio: `I'm the problem, it's me`,
      },
      {
        provider: 'native',
        email: 't9@seed.com',
        password: await bcrypt.hash('t9', saltRounds),
        name: 'Rihanna',
        avatar:
          'https://pbs.twimg.com/profile_images/1585851311701970945/fC9dfWVm_400x400.jpg',
        cover:
          'https://pbs.twimg.com/profile_banners/79293791/1666801643/1080x360',
        bio: `rihanna.lnk.to/fentyskin`,
      },
      {
        provider: 'native',
        email: 't10@seed.com',
        password: await bcrypt.hash('t10', saltRounds),
        name: 'KATY PERRY',
        avatar:
          'https://pbs.twimg.com/profile_images/1392465354622791687/w_KwtKcE_400x400.jpg',
        cover:
          'https://pbs.twimg.com/profile_banners/21447363/1681492261/1080x360',
        bio: 'LOVE is the key that unlocks every door🗝️♥️',
      },
      {
        provider: 'native',
        email: 't11@seed.com',
        password: await bcrypt.hash('t11', saltRounds),
        name: 'President Biden',
        avatar:
          'https://pbs.twimg.com/profile_images/1380530524779859970/TfwVAbyX_400x400.jpg',
        cover:
          'https://pbs.twimg.com/profile_banners/1349149096909668363/1686583051/1080x360',
        bio: `46th President of the United States, husband to @FLOTUS, proud dad & pop.`,
      },
      {
        provider: 'native',
        email: 't12@seed.com',
        password: await bcrypt.hash('t12', saltRounds),
        name: 'Barack Obama',
        avatar:
          'https://pbs.twimg.com/profile_images/1329647526807543809/2SGvnHYV_400x400.jpg',
        cover:
          'https://pbs.twimg.com/profile_banners/813286/1633800288/1080x360',
        bio: 'Dad, husband, President, citizen.',
      },
      {
        provider: 'native',
        email: 't13@seed.com',
        password: await bcrypt.hash('t13', saltRounds),
        name: 'Mike Pence',
        avatar:
          'https://pbs.twimg.com/profile_images/1372291427833683972/sCIeF9RC_400x400.jpg',
        cover:
          'https://pbs.twimg.com/profile_banners/22203756/1686669903/1080x360',
        bio: `Husband, Father, Grandfather, Christian, Conservative, Republican- In That Order, 48th Vice President, & Candidate for President of the United States`,
      },
      {
        provider: 'native',
        email: 't14@seed.com',
        password: await bcrypt.hash('t14', saltRounds),
        name: 'GOP',
        avatar:
          'https://pbs.twimg.com/profile_images/1488637837499154441/T7lImQVl_400x400.png',
        cover:
          'https://pbs.twimg.com/profile_banners/11134252/1630094486/1080x360',
        bio: 'Text FREEDOM to 80810 to receive exclusive updates from the Republican National Committee!',
      },
      {
        provider: 'native',
        email: 't15@seed.com',
        password: await bcrypt.hash('t15', saltRounds),
        name: 'Bruno Mars',
        avatar:
          'https://pbs.twimg.com/profile_images/1576667634736562177/djUXXBEI_400x400.jpg',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
        bio: 'Silk Sonic album is available everywhere!',
      },
      {
        provider: 'native',
        email: 't16@seed.com',
        password: await bcrypt.hash('t16', saltRounds),
        name: 'Adele',
        avatar:
          'https://pbs.twimg.com/profile_images/1448287947686617089/N7uf8mjs_400x400.jpg',
        cover:
          'https://pbs.twimg.com/profile_banners/184910040/1634133730/1500x500',
        bio: 'adele.com',
      },
      {
        provider: 'native',
        email: 'wa@seed.com',
        password: await bcrypt.hash('wa', saltRounds),
        name: 'WaForTest',
        avatar:
          'https://fakeimg.pl/200x200/AAB8C2,128/000,255/?text=Wa&font=noto',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
        bio: 'Welcome',
      },
      {
        provider: 'native',
        email: 'nba@seed.com',
        password: await bcrypt.hash('nba', saltRounds),
        name: 'nabForTest',
        avatar:
          'https://fakeimg.pl/200x200/AAB8C2,128/000,255/?text=nba&font=noto',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
        bio: 'Welcome',
      },
      {
        provider: 'native',
        email: 'music@seed.com',
        password: await bcrypt.hash('music', saltRounds),
        name: 'musicForTest',
        avatar:
          'https://fakeimg.pl/200x200/AAB8C2,128/000,255/?text=music&font=noto',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
        bio: 'Welcome',
      },
      {
        provider: 'native',
        email: 'pol@seed.com',
        password: await bcrypt.hash('pol', saltRounds),
        name: 'politicForTest',
        avatar:
          'https://fakeimg.pl/200x200/AAB8C2,128/000,255/?text=pol&font=noto',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
        bio: 'Welcome',
      },
    ]
    await queryInterface.bulkInsert('users', users, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {})
  },
}
