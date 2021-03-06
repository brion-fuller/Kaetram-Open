import log from '../lib/log';
import $ from 'jquery';
import Inventory from '../menu/inventory';
import Profile from '../menu/profile/profile';
import Actions from '../menu/actions';
import Bank from '../menu/bank';
import Enchant from '../menu/enchant';
import Warp from '../menu/warp';
import Shop from '../menu/shop';
import Header from '../menu/header';

export default class MenuController {
    constructor(game) {
        var self = this;

        self.game = game;

        self.notify = $('#notify');
        self.confirm = $('#confirm');
        self.message = $('#message');
        self.fade = $('#notifyFade');
        self.done = $('#notifyDone');

        self.notification = $('#notification');
        self.title = $('#notificationTextTitle'); // notification title
        self.description = $('#notificationTextDescription'); // notification description
        self.notificationTimeout = null;

        self.inventory = null;
        self.profile = null;
        self.bank = null;
        self.actions = null;
        self.enchant = null;
        self.shop = null;
        self.header = null;

        self.loadNotifications();
        self.loadActions();
        self.loadWarp();
        self.loadShop();

        self.done.click(function () {
            self.hideNotify();
        });
    }

    resize() {
        var self = this;

        if (self.inventory) self.inventory.resize();

        if (self.profile) self.profile.resize();

        if (self.bank) self.bank.resize();

        if (self.enchant) self.enchant.resize();

        if (self.shop && self.shop.isVisible()) self.shop.resize();

        if (self.header) self.header.resize();

        self.resizeNotification();
    }

    loadInventory(size, data) {
        var self = this;

        /**
         * This can be called multiple times and can be used
         * to completely refresh the inventory.
         */

        self.inventory = new Inventory(self.game, size);

        self.inventory.load(data);
    }

    loadBank(size, data) {
        var self = this;

        /**
         * Similar structure as the inventory, just that it
         * has two containers. The bank and the inventory.
         */

        if (!self.inventory) {
            log.error('Inventory not initialized.');
            return;
        }

        self.bank = new Bank(self.game, self.inventory.container, size);

        self.bank.load(data);

        self.loadEnchant();
    }

    loadProfile() {
        var self = this;

        if (!self.profile) self.profile = new Profile(self.game);
    }

    loadActions() {
        var self = this;

        if (!self.actions) self.actions = new Actions(self);
    }

    loadEnchant() {
        var self = this;

        if (!self.enchant) self.enchant = new Enchant(self.game, self);
    }

    loadWarp() {
        var self = this;

        if (!self.warp) self.warp = new Warp(self.game, self);
    }

    loadShop() {
        var self = this;

        if (!self.shop) self.shop = new Shop(self.game, self);
    }

    loadHeader() {
        var self = this;

        if (!self.header) self.header = new Header(self.game, self);
    }

    loadNotifications() {
        var self = this,
            ok = $('#ok'),
            cancel = $('#cancel'),
            done = $('#done');

        /**
         * Simple warning dialogue
         */

        ok.click(function () {
            self.hideNotify();
        });

        /**
         * Callbacks responsible for
         * Confirmation dialogues
         */

        cancel.click(function () {
            self.hideConfirm();
        });

        done.click(function () {
            log.info(self.confirm.className);

            self.hideConfirm();
        });
    }

    stop() {
        var self = this;

        if (self.inventory) self.inventory.clear();

        if (self.actions) self.actions.clear();

        if (self.profile) self.profile.clean();

        if (self.game.input) self.game.input.chatHandler.clear();

        if (self.bank) self.bank.clear();

        if (self.enchant) self.enchant.clear();

        if (self.warp) self.warp.clear();

        if (self.shop) self.shop.clear();
    }

    hideAll() {
        var self = this;

        if (self.inventory && self.inventory.isVisible()) self.inventory.hide();

        if (self.actions && self.actions.isVisible()) self.actions.hide();

        if (
            self.profile &&
            (self.profile.isVisible() || self.profile.settings.isVisible())
        )
            self.profile.hide();

        if (
            self.game.input &&
            self.game.input.chatHandler &&
            self.game.input.chatHandler.input.is(':visible')
        )
            self.game.input.chatHandler.hideInput();

        if (self.bank && self.bank.isVisible()) self.bank.hide();

        if (self.enchant && self.enchant.isVisible()) self.enchant.hide();

        if (self.warp && self.warp.isVisible()) self.warp.hide();

        if (self.shop && self.shop.isVisible()) self.shop.hide();
    }

    addInventory(info) {
        var self = this;

        self.bank.addInventory(info);
    }

    removeInventory(info) {
        var self = this;

        self.bank.removeInventory(info);
    }

    resizeNotification() {
        var self = this;

        if (self.isNotificationVisible())
            self.notification.css(
                'top',
                window.innerHeight - self.notification.height() + 'px'
            );
    }

    showNotification(title, message, colour) {
        var self = this,
            top = window.innerHeight - self.notification.height();

        if (self.isNotificationVisible()) {
            self.hideNotification();

            setTimeout(function () {
                self.showNotification(title, message, colour);
            }, 700);

            return;
        }

        self.title.css('color', colour);

        self.title.text(title);
        self.description.text(message);

        self.notification.addClass('active');
        self.notification.css('top', top + 'px');

        if (self.notificationTimeout) return;

        self.notificationTimeout = setTimeout(function () {
            self.hideNotification();
        }, 4000);
    }

    hideNotification() {
        var self = this;

        if (!self.isNotificationVisible()) return;

        clearTimeout(self.notificationTimeout);
        self.notificationTimeout = null;

        self.notification.removeClass('active');
        self.notification.css('top', '100%');
    }

    displayNotify(message) {
        var self = this;

        if (self.isNotifyVisible()) return;

        self.notify.css('display', 'block');
        self.fade.css('display', 'block');
        self.message.css('display', 'block');

        self.message.text(message);
    }

    displayConfirm(message) {
        var self = this;

        if (self.isConfirmVisible()) return;

        self.confirm.css('display', 'block');
        self.confirm.text(message);
    }

    hideNotify() {
        var self = this;

        self.fade.css('display', 'none');
        self.notify.css('display', 'none');
        self.message.css('display', 'none');
    }

    hideConfirm() {
        this.confirm.css('display', 'none');
    }

    getQuestPage() {
        return this.profile.quests;
    }

    getProfessionPage() {
        return this.profile.professions;
    }

    isNotifyVisible() {
        return this.notify.css('display') === 'block';
    }

    isConfirmVisible() {
        return this.confirm.css('display') === 'block';
    }

    isNotificationVisible() {
        return this.notification.hasClass('active');
    }
}
