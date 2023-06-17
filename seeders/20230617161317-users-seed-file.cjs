'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const users = [
      {
        provider: 'native',
        email: 't1@seed.com',
        password: 't1',
        name: 'Bleacher Report NBA',
        avatar:
          'https://pbs.twimg.com/profile_images/1266053203616989186/ozSULDRt_400x400.jpg',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
      },
      {
        provider: 'native',
        email: 't2@seed.com',
        password: 't2',
        name: 'SHAQ',
        avatar:
          'https://pbs.twimg.com/profile_images/1579949436527988737/RDqn1udJ_400x400.jpg',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
      },
      {
        provider: 'native',
        email: 't3@seed.com',
        password: 't3',
        name: 'Stephen Curry',
        avatar:
          'https://pbs.twimg.com/profile_images/1542667356949819392/IyRCxMgo_400x400.jpg',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
      },
      {
        provider: 'native',
        email: 't4@seed.com',
        password: 't4',
        name: 'LeBron James',
        avatar:
          'https://pbs.twimg.com/profile_images/1421530540063092736/xqtcu8HX_400x400.jpg',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
      },
      {
        provider: 'native',
        email: 't5@seed.com',
        password: 't5',
        name: 'Trae Young',
        avatar:
          'https://pbs.twimg.com/profile_images/1225597479711858688/-G9orx5h_400x400.jpg',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
      },
      {
        provider: 'native',
        email: 't6@seed.com',
        password: 't6',
        name: 'Atlanta Hawks',
        avatar:
          'https://pbs.twimg.com/profile_images/1642782600618991616/TovAAzTb_400x400.jpg',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
      },
      {
        provider: 'native',
        email: 't7@seed.com',
        password: 't7',
        name: 'NASA',
        avatar:
          'https://pbs.twimg.com/profile_images/1321163587679784960/0ZxKlEKB_400x400.jpg',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
      },
      {
        provider: 'native',
        email: 't8@seed.com',
        password: 't8',
        name: 'Taylor Swift',
        avatar:
          'https://pbs.twimg.com/profile_images/1564101520043479043/eJpWqka2_400x400.jpg',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
      },
      {
        provider: 'native',
        email: 't9@seed.com',
        password: 't9',
        name: 'Rihanna',
        avatar:
          'https://pbs.twimg.com/profile_images/1585851311701970945/fC9dfWVm_400x400.jpg',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
      },
      {
        provider: 'native',
        email: 't10@seed.com',
        password: 't10',
        name: 'KATY PERRY',
        avatar:
          'https://pbs.twimg.com/profile_images/1392465354622791687/w_KwtKcE_400x400.jpg',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
      },
      {
        provider: 'native',
        email: 't11@seed.com',
        password: 't11',
        name: 'President Biden',
        avatar:
          'https://pbs.twimg.com/profile_images/1380530524779859970/TfwVAbyX_400x400.jpg',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
      },
      {
        provider: 'native',
        email: 't12@seed.com',
        password: 't12',
        name: 'Barack Obama',
        avatar:
          'https://pbs.twimg.com/profile_images/1329647526807543809/2SGvnHYV_400x400.jpg',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
      },
      {
        provider: 'native',
        email: 't13@seed.com',
        password: 't13',
        name: 'Mike Pence',
        avatar:
          'https://pbs.twimg.com/profile_images/1372291427833683972/sCIeF9RC_400x400.jpg',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
      },
      {
        provider: 'native',
        email: 't14@seed.com',
        password: 't14',
        name: 'GOP',
        avatar:
          'https://pbs.twimg.com/profile_images/1488637837499154441/T7lImQVl_400x400.png',
        cover: 'https://fakeimg.pl/1500x600/6495ED/6495ED',
      },
    ]
    await queryInterface.bulkInsert('users', users, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {})
  },
}
