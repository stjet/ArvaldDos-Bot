import type { Client, TextChannel } from "discord.js";
import { add_balance, add_item_to_user, get_all_role_income, get_all_users, update_role_income_last_claim } from "./db";
import { calc_role_income_claim } from "./util";
import config from "./config.json";
//some random discord imports too

export default function main(client: Client) {
  //possible: get all role_incomes, set up setTimeouts and setIntervals specifically for each of them
  //for now just poll at startup and every 1/3 hour
  async function role_income_poll() {
    const all_users = await get_all_users();
    const guild = await client.guilds.fetch(config.server);
    await guild.members.fetch();
    const server_roles = guild.roles;
    const role_incomes = await get_all_role_income();
    for (const role_income of role_incomes) {
      //see if it is the right time (at least x hours has passed)
      if (Date.now() < role_income.last_claim + role_income.hours * 60 * 60 * 1000) continue;
      //get discord users with that role
      const role_members = (await server_roles.fetch(role_income.role)).members;
      const [payout, cycles] = calc_role_income_claim(role_income.last_claim, role_income.hours, role_income.income);
      //filter out non-registered
      role_members.filter(
        (user) => all_users.some((user_info) => user_info.user === user.id)
      ).each(async (user) => {
        //pay them
        await add_balance(user.id, payout);
        await (client.channels.cache.get(config.role_income_channel) as TextChannel).send({
          content: `Paid ${payout} (${role_income.income} * ${cycles}) ${ payout === 1 ? config.currency : config.currency_plural } to <@${user.id}> for <@&${role_income.role}>`,
          allowedMentions: {},
        });
        if (role_income.items) {
          for (const item of role_income.items) {
            const [given, _] = calc_role_income_claim(role_income.last_claim, role_income.hours, item[1]);
            await add_item_to_user(user.id, item[0], given);
            await (client.channels.cache.get(config.role_income_channel) as TextChannel).send({
              content: `Gave ${given} (${item[1]} * ${cycles}) of \`${item[0]}\` to <@${user.id}> for <@&${role_income.role}>`,
              allowedMentions: {},
            });
          }
        }
      });
      //then update db with new latest claim time
      await update_role_income_last_claim(role_income.role);
    }
  }
  role_income_poll();
  setInterval(role_income_poll, 20 * 60 * 1000);
}

