import { Context, Dict, Random, Schema } from 'koishi'
import { DB } from './database'
export const name = 'touch-favorite'
export const usage = "QQ戳一戳好感系统\\n功能(暂定)：戳一戳随着好感等级提高回复不同内容，自定义每个等级的随机回复内容，其他功能看反馈再酌情酌情。反馈：可加2864931178."


export interface Config {
  'reply1': Array<string>;
  'reply2': Array<string>;
  'reply3': Array<string>;
  'reply4': Array<string>;
  'reply5': Array<string>;
  'reply6': Array<string>;
  'reply7': Array<string>;
  'reply8': Array<string>;
  'reply9': Array<string>;
  'reply10': Array<string>;
}

export const Config: Schema<Config> = Schema.intersect([
  Schema.object({
    'reply1': Schema.array(String).description('好感等级1台词'),
    'reply2': Schema.array(String).description('好感等级2台词'),
    'reply3': Schema.array(String).description('好感等级3台词'),
    'reply4': Schema.array(String).description('好感等级4台词'),
    'reply5': Schema.array(String).description('好感等级5台词'),
    'reply6': Schema.array(String).description('好感等级6台词'),
    'reply7': Schema.array(String).description('好感等级7台词'),
    'reply8': Schema.array(String).description('好感等级8台词'),
    'reply9': Schema.array(String).description('好感等级9台词'),
    'reply10': Schema.array(String).description('好感等级10台词')
  }).description('回复台词'),
])
export function apply(ctx: Context, config: Config) {
  ctx.on('notice/poke', async (session) => {
    if (session.targetId === session.selfId) {
      if ((await ctx.database.stats()).tables.favorite == undefined) {
        DB.initialFavoriteTable(ctx);
      }
      await FavoriteDecide(ctx, session);
      await reply(ctx, session, config);
    }
  })
  ctx.command('bot好感查询', '康康她有多爱你~')
    .action(async ({session}) => {
      let data = await DB.queryDB(ctx, session);
      let level = data[0].level;
      let value = data[0].value;
      let nextvalue = nextValue(level)
      session.send(`<at id="${session.userId}"/>你的当前好感等级是${level}\\n经验值是${value}\\n距离下一级还有${nextvalue-value}的经验要刷~`)
    })
}
async function FavoriteDecide(ctx: Context, session) {
  let data = await DB.queryDB(ctx, session);
  if (data.length == 0) {
    await ctx.database.create('favorite', { userid: session.userId });
    data = await DB.queryDB(ctx, session);
  }
  let level = data[0].level;
  let value = data[0].value;
  let nextvalue = nextValue(level);
  if (value < nextvalue || value == 0) {
    await DB.addValue(ctx, session);
    value = (await ctx.database.get('favorite', { userid: session.userId }, ['value']))[0].value;
  }
  if (value >= nextvalue && value != 0) {
    if(level<10){
      await DB.levelUp(ctx, session);
      level = (await ctx.database.get('favorite', { userid: session.userId }, ['level']))[0].level;  
    }else{
      session.send(`<at id="${session.userId}"/>怎么可能有人把好感拉满了 我不相信！！！`)
    }
  }
}
async function reply(ctx: Context, session, config: Config) {
  let level = (await ctx.database.get('favorite', { userid: session.userId }, ['level']))[0].level;
  const replyArrays = [
    config.reply1,
    config.reply2,
    config.reply3,
    config.reply4,
    config.reply5,
    config.reply6,
    config.reply7,
    config.reply8,
    config.reply9,
    config.reply10,
  ];
  if (level >= 1 && level <= 10) {
    let ran = Random.int(replyArrays[level - 1].length);
    session.send(`<at id="${session.userId}"/>${replyArrays[level - 1][ran]}`)
  } else {
    session.send(`<onebot:poke qq="${session.userId}"/>`)
  }
}
function nextValue(level) {
  if(level<0){
    return 0;
  }else if(level>=0&&level<=8){
    return Math.pow(2,level);
  }else if(level>8&&level<=10){
    return (Math.pow(2,level)-Math.pow(3,(10-level)));
  }else{
    return 0;
  }
}