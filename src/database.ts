import { timeStamp } from 'console'
import { Context, Eval } from 'koishi'
declare module 'koishi' {
    interface Tables {
        favorite: Favorite
    }
}
export interface Favorite {
    userid: string
    value: number
    level: number
    touchTime:Date
}
export module DB {
    export function initialFavoriteTable(ctx: Context) {
        ctx.model.extend('favorite', { userid: 'string', value: { type: 'integer', initial: 0, nullable: false }, level: { type: 'integer', initial: 0, nullable: false },touchTime:{type:'timestamp'} }, { unique: ['userid'], primary: ['userid'], autoInc: false });
    }
    export async function levelUp(ctx, session) {
        await ctx.database.set('favorite', { userid: session.userId }, { 'level': { $add: [{ $: 'level' }, 1] } as Eval<Number>, 'value': 0 })
      }
    export async function addValue(ctx, session) {
        await ctx.database.set('favorite', { userid: session.userId }, { 'value': { $add: [{ $: 'value' }, 1] } as Eval<Number> })
      }
    export async function queryDB(ctx,session){
        return await ctx.database.get('favorite', { userid: session.userId });
      }
}