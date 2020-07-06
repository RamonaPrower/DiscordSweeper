module.exports = {
    async getLinkObject(link, client) {
        const splitStr = link.match(/\d+/gmi);
        const obj = {};
        const foundGuild = client.guilds.cache.get(splitStr[0]);
        if (!foundGuild) {
            obj.found = false;
            obj.reason = 'Couldn\'t find the server this message was in';
            return obj;
        }
        obj.guild = foundGuild;
        const foundChannel = obj.guild.channels.cache.get(splitStr[1]);
        if (!foundChannel) {
            obj.found = false;
            obj.reason = 'Couldn\'t find the Channel this message was in';
            return obj;
        }
        obj.channel = foundChannel;
        let foundMessage;
        try {
            foundMessage = await obj.channel.messages.fetch(splitStr[2]);
        }
        catch (error) {
            obj.found = false;
            obj.reason = 'Couldn\'t find the message';
            return obj;
        }
        obj.found = true;
        obj.message = foundMessage;
        return obj;
    },
};