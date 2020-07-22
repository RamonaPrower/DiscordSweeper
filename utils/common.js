module.exports = {
    async getLinkObject(link, client) {
        const splitStr = link.match(/\d+/gmi);
        const obj = {};
        // const foundGuild = client.guilds.cache.get(splitStr[0]);
        // if (!foundGuild) {
        //     obj.found = false;
        //     obj.reason = 'Couldn\'t find the server this message was in';
        //     return obj;
        // }
        // obj.guild = foundGuild;
        const foundChannel = await client.channels.fetch(splitStr[splitStr.length - 2]);
        if (!foundChannel) {
            obj.found = false;
            obj.reason = 'Couldn\'t find the Channel this message was in';
            return obj;
        }
        obj.channel = foundChannel;
        let foundMessage;
        try {
            foundMessage = await obj.channel.messages.fetch(splitStr[splitStr.length - 1]);
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
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },
};