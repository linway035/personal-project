'use strict'

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const tweets = [
      {
        user_id: 18,
        content: `因為昨天KD的受傷，有不少人提到這個「傷病特例」。 認為就算KD留在勇士，也可以用傷病特例進行補強，但似乎有些誤解。 傷病特例並不是「薪資不用計算」「薪資不用付豪華稅」，而是多出可用的額度。 首先，這幾篇談薪資的文章，都有很多人問一個問題：`,
      },
      {
        user_id: 18,
        content: `「既然NBA是軟上限，那為什麼還要有薪資上限？？」 因為要簽自由球員還是得騰出薪資空間，只有鳥權續約等特例條款才可以避開上限。 甚至躲過了軟上限，還有硬上限(超過就不能使用全額中產)跟豪華稅等大關要過。`,
      },
      {
        user_id: 18,
        content: `「如果有老闆金錢無限，他可以簽12個全明星嗎？」答案是不行，因為簽球員是用薪資空間，而NBA有薪資上限，沒有空間就不能開大約。除非這12個全明星有大半願意領底薪，但這種事恐怕只有打電動才會發生。(底薪也是一種「特例條款」)`,
      },
      {
        user_id: 18,
        content: `有空間才能簽人，沒有空間只能用中產、底薪等特例條款簽人，瞭解了薪資空間的概念後，就可以理解特例條款是什麼東西：傷病條款正式名稱是「Disabled Player Exception」(無法上場球員的特例條款)`,
      },
      {
        user_id: 18,
        content: `「受傷球員的一半薪資，或全額中產，兩者取其低」的一種特例條款。 以KD的薪資來看，當然就是勇士隊可以多一個全額中產(約9.2M)可以使用。 可以拿來簽自由球員，也可以拿來交易，但這個錢花下去是要付豪華稅的。`,
      },
      {
        user_id: 18,
        content: `以昨天所計算勇士預估薪資為「超出豪華稅門檻20M」來看，若使用這個傷病特例， 會是「9.2M薪資」+「41.2M豪華稅」。 是的，會是拿五千萬美金來簽一個中產。`,
      },
      {
        user_id: 18,
        content: `至於「薪資下架」，還是要付給球員，也許由保險公司付，但不佔薪資與豪華稅額度。 這則是另一個條款，不屬於簽約的特例。 injury exclusion(傷病排除)，這是當球員受了嚴重到退休的傷，或是危及生涯的病。 可以用這個條款把球員釋出，且下架其薪資`,
      },
      {
        user_id: 18,
        content: `但需要由聯盟醫療代表判定並允許。熱火的Bosh就是用這個條款來免掉熱火隊今年豪華稅的。大概是這樣，「薪資特例」(多一個中產簽人)， 跟「薪資下架」(這筆不佔空間不用付豪華稅)是兩件不同的事。 分清楚會比較好。 一點討論，有誤也請指正，謝謝。`,
      },
      {
        user_id: 18,
        content: `新版CBA改規則了，現在只能卡36小時(最短)~60小時(最長)。而且RFA本來就不會在6/30起的第一波FA，現在市場上也沒什麼人了，RFA才得到報價。Bobby Marks的舉例(以12PM為分界點)：「如果7/6的1200之前接受報價，`,
      },
      {
        user_id: 18,
        content: `7/7的2359前要決定是否跟進」但「如果是7/6的1500才接受報價，可以延到7/8的2359再來決定」不過阿拓也沒拖很久就是了。這個霸王條款是「跟進RFA」後自動產生的，不是合約規定。也解釋一下RFA(受限自由球員)跟進的事。`,
      },
      {
        user_id: 18,
        content: `○報價被接受後，母隊只能選擇「跟進/不跟進」報價，沒有再往上或簽換等選擇了 ○跟進報價要概括承受裡面所有條款。 Thybulle合約裡面包括「第三年PO」「15%交易補償金」「提前支付薪資」等優渥條件 阿拓跟進之後，這些全部要吞下去。`,
      },
      {
        user_id: 18,
        content: `○明年1/15前不得交易 ○一年內交易必須要球員本身同意(霸王條款) ○一年內不能交易球員到開出報價那隊(Thybulle的狀況是小犢)新版CBA下，交易補償金(Trade kicker)會大幅增加交易難度。`,
      },
      {
        user_id: 18,
        content: `以前交易的薪資對等是「可以收進125%的薪資+0.1M」(丟出1000萬可以拿回1260萬)， 新版CBA改成「收進薪資超過110%就觸發第一層硬上限」。但交易補償金的計算更複雜，會造成兩邊不對等。`,
      },
      {
        user_id: 18,
        content: `若Thybulle後兩年是22M，交易補償金是3.3M，必須加到剩下薪資裡平攤。得到Thybulle的球隊，得到的是(11+3.3/2)M的球員。但阿拓若不想觸發硬上限，只能回收12.1M的球員(11M的110%)。(以前可13.75M)`,
      },
      {
        user_id: 18,
        content: `簡單說，收進該名球員的球隊(B)，薪資要以「加上交易補償金」計算。 但送出該名球員的球隊(A)，薪資只能是原本的薪資，兩邊不對等。 當然，交易補償金是球員方可以放棄的。 但這就又增加了交易上的難度。`,
      },
      {
        user_id: 18,
        content: `拓荒者這個跟進是合理的(價格並不是太高)，所以小犢也才會到這麼晚才報價， 而跟下去之後不太好處理也是事實，但球員福利得到提升(PO、交易補償金、提前支付)。這也是RFA設立的目的，就算母隊可以跟也會有點痛，而球員拿到的合約條件會更好。`,
      },
      {
        user_id: 18,
        content: `稍微解釋一下Grant Williams交易的狀況。 他是RFA(受限制自由球員)，但塞爾蒂克薪資爆了，基本上留不住他。 所以是要用這個RFA條件來「多少換一點資產」。(原本記者傳出的開價甚至是首輪籤)`,
      },
      {
        user_id: 18,
        content: `塞爾蒂克目前薪資：177M，離第二層硬上限只剩下5M左右的距離。 小犢則是想得到Grant Williams，擠一擠薪資後，有一發約略全額中產的空間。 雖然可以用全額中產報價RFA(至少兩年合約)，但有可能被塞爾蒂克硬跟(RFA的關係)`,
      },
      {
        user_id: 18,
        content: `但他們有兩個目標：Grant Williams跟Matisse Thybulle，都是RFA。 用簽換的方式可以確保母隊不會硬跟報價， 但塞爾蒂克薪資爆了不想吃小犢丟出來的薪資，所以得找第三方幫忙吃，他們找上了馬刺隊。`,
      },
      {
        user_id: 18,
        content: `馬刺：就當好人吃薪資啊 Reggie Bullock今年10.5M，到期約。 拿到一個2030年的小犢無保護首輪交換權，當成手續費。「簽換交易」(sign-and-trade) ○ 至少三年合約 ○ 收進簽換的自由球員會觸發硬上限`,
      },
      {
        user_id: 18,
        content: `因此小犢這個交易也確定觸發硬上限了，本季薪資不能超過172.3M的天險。 (先前Seth Curry的4.5M也會是確定是用雙年特例簽下) 他們還有一發12.4M全額中產可以使用，但可能不能全用(撞硬上限)。`,
      },
      {
        user_id: 18,
        content: `有可能裁掉並攤提JaVale McGee的合約，再擠出一點額度來使用全額中產。 塞爾蒂克拿到2024、2025、2028三個次輪籤(誰的還不清楚)`,
      },
      {
        user_id: 18,
        content: `也因為送出Grant Williams換空氣(選秀籤在交易中視為零元)的關係，他們會得到一筆6M左右的交易特例(TE)，期限一年，不一定要用但有時很好用。`,
      },
      {
        user_id: 18,
        content: `由於離第二層硬上限很近，5M的付稅中產不一定會使用。馬刺：薪資快填滿136M了(目前130M，已超過薪資下限的123M)。 然後還有一發7.7M的空間中產可以簽人。`,
      },
      {
        user_id: 18,
        content: `拿到的主菜是2030年的小犢首輪交換權，還有七年現在談太早，但無保護就是香。 大概是這樣。 算是難得看到的「球隊+球員」通通是贏家的三贏甚至四贏交易吧？`,
      },
      {
        user_id: 18,
        content: `簡單講一下這個交易的邏輯。「騎士要簽Max Strus」薪資超過全額中產，騎士沒有薪資空間可以裸簽，只能運作簽換(簽換至少簽三年)。 簽換，騎士必須要拋出薪資包以符合薪資對等。不過...`,
      },
      {
        user_id: 18,
        content: `「熱火薪資爆了，不打算收進騎士薪資包」所以拉第三方，找到了有薪資空間可以直接吃薪資包的馬刺。「交易規定一定要有進有出，所以馬刺出一支二輪籤」 「但馬刺幫忙吃薪資還要出籤不划算，所以他們也拿回一支二輪籤」`,
      },
      {
        user_id: 18,
        content: `這算是蠻典型的「三方交易」與「簽換」的例子。對於熱火來說，Max Strus要離隊，其實是留不住的。但Strus想去的球隊(騎士)不能裸簽，熱火就可以幫忙簽換。只是騎士薪資包實在吞不下去(熱火薪資爆了)，再拉第三方(馬刺)來幫忙。`,
      },
      {
        user_id: 18,
        content: `不過上季打進東西決賽的四支球隊，有三支都拆了不少。塞爾蒂克還可以說是補強，繼續繳稅。熱火跟湖人都是直接拼節稅，甚至湖人現在還低於稅線。打進西決後不到兩個月啟動節稅，更有可能免繳稅。別人是怕新制的第二層硬上限，珍妮連第一層都過不去是怎樣。`,
      },
      {
        user_id: 18,
        content: `隨著新版勞資協議的越來越多細節公開，跟這季薪資空間直接「10%漲好漲滿」。可以預估兩年後指定新秀的價碼了。(且新版CBA拿掉指定新秀每隊限兩人的規定)當然，Austin Reaves不是首輪新秀又只簽兩年底薪，不能簽指定新秀。`,
      },
      {
        user_id: 18,
        content: `主要是可以看他跟同梯的比較。AR是2021年進NBA，落選。那年有誰呢。Evan Mobley，Scottie Barnes，Cade Cunningham...等人。`,
      },
      {
        user_id: 18,
        content: `沒意外的話他們都會拿到指定新秀，如果第四年進前三隊還會再加薪。「鎖死10%漲幅」看起來不多，但以今年123M→136M來看，明年就149.6M了，後年將會是165M。25%頂薪(指定新秀)－41.25M 30%頂薪(進前三隊)－49.5M`,
      },
      {
        user_id: 18,
        content: `AR的毒藥合約有多毒？ 12M, 13M, 36M, 38M。這是最毒的4y99M。 但因為毒藥合約當時的背景是「NBA每年薪資空間幾乎沒有成長」， 拿到現在每年漲10%，赫然發現，兩年後明明應該是毒藥的36M，連25%頂薪都不到？`,
      },
      {
        user_id: 18,
        content: `這什麼毒藥？包著糖衣的毒藥，吃完糖衣裡面還是毒，現在是連內餡都不毒啊。 更不用說前兩年便宜到一個可怕。 因為NBA每年薪資空間都上漲的關係，合約要用當下那年來看， 兩年後的36M，還不到25%頂薪。`,
      },
      {
        user_id: 18,
        content: `如果最後是以4y80M成交的話更是便宜。 大概會是12M, 13M, 27M, 28M。 屆時他的同梯拿41M頂薪，甚至是49M頂薪，他拿27M.... 大通膨時代，真的好可怕。`,
      },
      {
        user_id: 18,
        content: `一點基於新CBA的補充。 PS. 所以湖人真的要擔心的是沒人開價給AR，知道湖人必跟，不願意開價， 湖人自己開價不能開到四年99M，只有一半的四年53M，這個AR不可能簽。`,
      },
      {
        user_id: 18,
        content: `最壞就是妥協一份兩年25M的合約，兩年後AR變成不受限自由球員。AR少了落袋為安，湖人少了長約控制期，會變成雙輸。`,
      },
      {
        user_id: 18,
        content: `太陽隊薪資直接突破天際，新老闆完全一改過去Robert Sarver的作風， 在限制「鈔能力」的新制勞資規定(Collective Bargaining Agreement，CBA)下，太陽隊開出第一槍，勇於挑戰"第二層硬上限"。`,
      },
      {
        user_id: 18,
        content: `下季薪資空間預估132M，豪華稅門檻162M， 但太陽光是四個頂薪球員已經163M，爆稅。 湊滿開季名單後，幾乎是一定突破179.5M的第二層硬上限。 但6/20的現在，完整包裹還沒出來，也就是還沒把交易內容送交聯盟。`,
      },
      {
        user_id: 18,
        content: `細部修改還是會有，可能是三方，或是多些配菜，但大方向卻是確定的。「巫師要甩掉Bradley Beal還有四年超過200M的巨大合約，而且Beal還有霸王條款」 霸王條款，NTC，在NBA不看實力，跟年度第幾隊無關，而是年資規定`,
      },
      {
        user_id: 18,
        content: `「生涯八年以上，在該隊待四年以上」的「可以」給霸王條款。 (但符合的也不一定會給) Beal因為有霸王條款，交易要得到他同意，所以巫師能做的選擇很少。`,
      },
      {
        user_id: 18,
        content: `以「清薪資」來說，最簡單的作法就是賣給有空間的球隊「換空氣」(跟選秀籤)，但因為霸王條款，Beal可以拒絕被這樣交易，使得巫師只能降薪資而不能換空氣。Beal薪資是43.27M，根據薪資規定，要換到他，至少需要拿出34.48M的薪資包。`,
      },
      {
        user_id: 18,
        content: `太陽隊出的薪資包是：CP3+Landry Shamet10.25M全額保障(之後兩年非保障，可視為到期約)。而因為CP3明年是部份保障(後年非保障)，全薪是30.8M，但只有保障15.8M，以NBA規定來看，只要提高保障金額，以符合薪資包即可`,
      },
      {
        user_id: 18,
        content: `所以大概是拉高Chris Paul的保障金額到24.3M左右。如果裁掉CP3並攤提成五年(剩兩年，2*2+1)，每年只要4.8M。 就算加上Shamet的全額薪資，對巫師來講，也比留住Beal要省下31.69M。`,
      },
      {
        user_id: 18,
        content: `在薪資管理的考量上，巫師這樣子交易是合算的。 畢竟因為Beal霸王條款的關係，很難拿到更好的條件，他隨時可以否決交易。`,
      },
    ]
    await queryInterface.bulkInsert('tweets', tweets, {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('tweets', null, {})
  },
}