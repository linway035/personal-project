'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tweets = [
      {
        user_id: 1,
        content:
          'Hornets prefer Brandon Ingram over Zion in a potential trade involving the No. 2 pick, per @ShamsCharania',
      },
      {
        user_id: 1,
        content:
          'NBPA releases statement on Ja Morant’s 25-game suspension, calling it ‘excessive and inappropriate for a number of reasons.',
      },
      {
        user_id: 1,
        content:
          'The Heat and Bucks are expected to talk with Bradley Beal and his agent, per B/R’s @ChrisBHaynes',
      },
      {
        user_id: 1,
        content:
          'Michael Jordan is finalizing a sale of the Hornets, ending his 13-year run as majority owner, per @wojespn The sale is to a group led by Gabe Plotkin and Rick Schnall.',
      },
      {
        user_id: 2,
        content:
          'Y’all agree with this? I DON’T.. KOBE #9 and me #10??? Hell to the nawwww',
      },
      {
        user_id: 2,
        content: 'Who did this? Lol',
      },
      {
        user_id: 2,
        content: '4 - 2 in favor of my team, yup I said it! Who you got?',
      },
      {
        user_id: 3,
        content:
          'Black Excellence! Check it out,  #BlackPop coming June 19 to @eentertainment 🙌🏽',
      },
      {
        user_id: 3,
        content:
          'Amazing vibes in The Town with @carmax , Eat. Learn. Play and their youth development partner Oakland Genesis!!',
      },
      {
        user_id: 3,
        content:
          'Two of the very best teaming up to provide more access to golf for underrepresented youth.',
      },
      {
        user_id: 4,
        content: 'Welcome to the @IPROMISESchool family!!!',
      },
      {
        user_id: 4,
        content: 'BLACK EXCELLENCE AT ITS FINEST!!!',
      },
      {
        user_id: 4,
        content: 'It’s a celebration for everyone!! Let’s free it @tacobell',
      },
      {
        user_id: 5,
        content: 'Did something really cool today',
      },
      {
        user_id: 5,
        content: 'Another Day, Another Opportunity💯',
      },
      {
        user_id: 5,
        content:
          'Jokic ain’t gotta say sh+t about himself, Coach Malone gonna do it for him🫡',
      },
      {
        user_id: 6,
        content: 'New faces in the 🅰️',
      },
      {
        user_id: 6,
        content: 'Happy #NationalMascotDay to @HarryTheHawk! Never change',
      },
      {
        user_id: 6,
        content: 'GM Landry Fields speaks in advance of Thursday’s NBA Draft',
      },
      {
        user_id: 7,
        content:
          'Another busy week at NASA @NASA_Astronauts install solar arrays on the @Space_Station, a new X-plane is named, and a laser communication system for #Artemis awaits integration.',
      },
      {
        user_id: 7,
        content: 'Steve Bowen, 10-time spacewalker.',
      },
      {
        user_id: 7,
        content:
          "Enceladus, Saturn's icy moon, is known for its geysers that erupt with water from a subsurface ocean. Scientists have just detected phosphorus—an uncommon element that's a key building block for life—in the plumes that these geysers spray",
      },
      {
        user_id: 8,
        content:
          'Ahhhhh Detroit that was so much fun!! First time I performed at Ford Field was singing the anthem there in 2006 and I remember thinking it felt impossible for a place to be that big, I was sooo insanely nervous',
      },
      {
        user_id: 8,
        content:
          'Chicago that was sooooo epic. Playing 3 nights at Soldier Field and getting to sing ‘You All Over Me’ with @MarenMorris who I adore. You guys were so much fun to play for, I love you',
      },
      {
        user_id: 8,
        content:
          'Really thrilled to tell you this!! Mexico, Argentina and Brazil: We are bringing The Eras Tour to you this year!',
      },
      {
        user_id: 9,
        content: 'LOUIS VUITTON MEN Spring Summer 2024.',
      },
      {
        user_id: 9,
        content:
          'for baby bottom smooth skin….get into this brand new #CHERRYDUB scrub, 1 for face and 1 for bodyyy',
      },
      {
        user_id: 9,
        content: 'this shirt is old…',
      },
      {
        user_id: 10,
        content:
          'One of my greatest passions is the ability to pay music forward through my arts based foundation @fireworkfound! Was amazing to be with so many young people and see their spark ignite at camp earlier this month',
      },
      {
        user_id: 10,
        content:
          'Together, let’s raise much needed funds for organizations providing life-saving resources and services for the LGBTQ+ community like GLAAD, SAGE, The Trevor Project, the National Black Justice Coalition, CenterLink and Outright International.',
      },
      {
        user_id: 11,
        content: 'We must provide a pathway to citizenship for Dreamers.',
      },
      {
        user_id: 11,
        content:
          'Tune in as I provide an update on his Administration’s work to aid I-95 reconstruction efforts.',
      },
      {
        user_id: 11,
        content:
          "High-speed internet is no longer a luxury, it’s a necessity. That's why my Administration is investing in expanding access to affordable high-speed internet to close the digital divide.",
      },
      {
        user_id: 12,
        content:
          'Congrats to the Denver @Nuggets and the remarkable finals MVP Nikola Jokić for bringing home the franchise’s first NBA Championship!',
      },
      {
        user_id: 12,
        content:
          'Where does the time go? Happy birthday, Sasha! It’s been the greatest gift to watch you become such a confident, intelligent, and beautiful young woman. Can’t wait to see what this year ahead brings you.',
      },
      {
        user_id: 12,
        content:
          'In an important victory for Black Alabamians and voters of color across the country, the Supreme Court has upheld Section 2 of the Voting Rights Act.',
      },
      {
        user_id: 13,
        content:
          'I believe in the American people, and I have faith God is not done with America yet. Together, we can bring this Country back, and the best days for the Greatest Nation on Earth are yet to come!',
      },
      {
        user_id: 13,
        content:
          'Pence: Huntsville conference ‘holds the keys’ to America’s future - Yellowhammer News',
      },
      {
        user_id: 13,
        content: 'Pence on Trump, the GOP and His Campaign for President | ',
      },
      {
        user_id: 14,
        content:
          'NIGHTMARE: What if Joe Biden, the weakest president we’ve ever had, is re-elected?',
      },
      {
        user_id: 14,
        content:
          '181 Congressional Democrats followed Joe Biden’s lead and voted to ban gas stoves.',
      },
    ]
    await queryInterface.bulkInsert('tweets', tweets, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tweets', null, {})
  },
}
