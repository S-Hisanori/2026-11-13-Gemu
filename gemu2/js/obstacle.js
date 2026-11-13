/**
 * 障害物クラスおよび障害物管理モジュール
 */

import { intersects } from './collision.js';

// 障害物の種類定義
export const ObstacleType = {
    CACTUS_SMALL: 'CACTUS_SMALL',
    CACTUS_LARGE: 'CACTUS_LARGE',
    CACTUS_GROUP: 'CACTUS_GROUP',
    ROCK: 'ROCK'
};

/**
 * 単一の障害物クラス
 */
export class Obstacle {
    /**
     * @param {string} type 
     * @param {number} startX 出現X座標
     * @param {number} groundY 地面のY座標
     */
    constructor(type, startX, groundY = 250) {
        this.type = type;
        this.x = startX;
        this.groundY = groundY;

        // 種類ごとのサイズ設定
        switch (type) {
            case ObstacleType.CACTUS_SMALL:
                this.width = 18;
                this.height = 36;
                break;
            case ObstacleType.CACTUS_LARGE:
                this.width = 26;
                this.height = 50;
                break;
            case ObstacleType.CACTUS_GROUP:
                this.width = 54;
                this.height = 38;
                break;
            case ObstacleType.ROCK:
                this.width = 30;
                this.height = 20;
                break;
            default:
                this.width = 20;
                this.height = 35;
        }

        // 接地Y座標
        this.y = this.groundY - this.height;
    }

    /**
     * 更新処理
     * @param {number} deltaTime 
     * @param {number} speed 
     */
    update(deltaTime, speed) {
        this.x -= speed * deltaTime;
    }

    /**
     * 画面外に出たか判定
     * @returns {boolean}
     */
    isOffScreen() {
        return this.x + this.width < -10;
    }

    /**
     * 衝突判定用ヒットボックス（余白を削ったインセット矩形）
     * @returns {{x: number, y: number, width: number, height: number}}
     */
    getHitbox() {
        // 左右10%、上部10%縮小
        const insetX = this.width * 0.12;
        const insetY = this.height * 0.10;
        return {
            x: this.x + insetX,
            y: this.y + insetY,
            width: this.width - (insetX * 2),
            height: this.height - insetY
        };
    }

    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const color = '#535353';
        ctx.fillStyle = color;
        ctx.strokeStyle = color;

        switch (this.type) {
            case ObstacleType.CACTUS_SMALL:
                this.drawSmallCactus(ctx);
                break;
            case ObstacleType.CACTUS_LARGE:
                this.drawLargeCactus(ctx);
                break;
            case ObstacleType.CACTUS_GROUP:
                this.drawGroupCactus(ctx);
                break;
            case ObstacleType.ROCK:
                this.drawRock(ctx);
                break;
        }

        ctx.restore();
    }

    /**
     * 小サボテンの描画
     */
    drawSmallCactus(ctx) {
        // メインの幹
        ctx.fillRect(6, 0, 6, this.height);
        // 左の枝
        ctx.fillRect(0, 10, 6, 4);
        ctx.fillRect(0, 6, 4, 6);
        // 右の枝
        ctx.fillRect(12, 14, 6, 4);
        ctx.fillRect(14, 10, 4, 6);
    }

    /**
     * 大サボテンの描画
     */
    drawLargeCactus(ctx) {
        // メインの幹
        ctx.fillRect(9, 0, 8, this.height);
        // 左の大きな枝
        ctx.fillRect(0, 14, 9, 6);
        ctx.fillRect(0, 8, 5, 12);
        // 右の枝
        ctx.fillRect(17, 20, 9, 6);
        ctx.fillRect(21, 14, 5, 12);
        // サボテンの頭を少し丸める
        ctx.fillRect(10, 0, 6, 2);
    }

    /**
     * 複数サボテン（小・中並び）
     */
    drawGroupCactus(ctx) {
        // サボテン1 (左)
        ctx.fillRect(4, 8, 6, 30);
        ctx.fillRect(0, 16, 4, 4);
        ctx.fillRect(0, 14, 3, 4);

        // サボテン2 (中央: 少し高め)
        ctx.fillRect(22, 0, 7, 38);
        ctx.fillRect(15, 12, 7, 5);
        ctx.fillRect(15, 8, 4, 6);
        ctx.fillRect(29, 16, 6, 5);
        ctx.fillRect(31, 12, 4, 6);

        // サボテン3 (右)
        ctx.fillRect(42, 10, 6, 28);
        ctx.fillRect(48, 18, 5, 4);
        ctx.fillRect(49, 15, 4, 5);
    }

    /**
     * 砂漠の岩の描画
     */
    drawRock(ctx) {
        ctx.beginPath();
        ctx.moveTo(3, this.height);
        ctx.lineTo(0, this.height - 8);
        ctx.lineTo(6, 4);
        ctx.lineTo(16, 0);
        ctx.lineTo(24, 3);
        ctx.lineTo(this.width, this.height - 6);
        ctx.lineTo(this.width - 2, this.height);
        ctx.closePath();
        ctx.fill();

        // 岩の陰影・クラック線
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(10, 8);
        ctx.lineTo(16, 13);
        ctx.lineTo(20, 10);
        ctx.stroke();
    }
}

/**
 * 障害物全体の生成・管理クラス
 */
export class ObstacleManager {
    constructor(canvasWidth = 800, groundY = 250) {
        this.canvasWidth = canvasWidth;
        this.groundY = groundY;
        this.obstacles = [];

        this.spawnTimer = 1.5; // 初期生成までの待機秒数
    }

    /**
     * リセット
     */
    reset() {
        this.obstacles = [];
        this.spawnTimer = 1.5;
    }

    /**
     * 更新処理
     * @param {number} deltaTime 
     * @param {number} speed 現在の走行速度
     * @param {number} score 現在のスコア（出現パターンの解放に使用）
     */
    update(deltaTime, speed, score) {
        // 既存の障害物を移動
        for (let i = this.obstacles.length - 1; i >= 0; i--) {
            const obs = this.obstacles[i];
            obs.update(deltaTime, speed);

            // 画面外に出たら配列から削除
            if (obs.isOffScreen()) {
                this.obstacles.splice(i, 1);
            }
        }

        // スポーンタイマー更新
        this.spawnTimer -= deltaTime;

        if (this.spawnTimer <= 0) {
            // 無理ゲー防止チェック: 直前の障害物が画面右端から最低限の安全距離離れているか
            const lastObstacle = this.obstacles[this.obstacles.length - 1];
            const minSafeDistance = 240 + (speed * 0.1); // 速度に応じて安全間隔を自動計算

            if (!lastObstacle || (this.canvasWidth - (lastObstacle.x + lastObstacle.width)) >= minSafeDistance) {
                this.spawnObstacle(score);
                this.resetSpawnTimer(speed);
            } else {
                // 安全距離が確保されるまでわずかに待機
                this.spawnTimer = 0.15;
            }
        }
    }

    /**
     * 障害物の生成
     * @param {number} score スコアに応じた出現バリエーション
     */
    spawnObstacle(score) {
        // スコアに応じて解放される障害物プール
        const types = [ObstacleType.CACTUS_SMALL, ObstacleType.ROCK];

        if (score > 150) {
            types.push(ObstacleType.CACTUS_LARGE);
        }
        if (score > 350) {
            types.push(ObstacleType.CACTUS_GROUP);
        }

        const selectedType = types[Math.floor(Math.random() * types.length)];
        const startX = this.canvasWidth + 20;

        this.obstacles.push(new Obstacle(selectedType, startX, this.groundY));
    }

    /**
     * 次の出現までのタイマー設定
     * @param {number} speed 
     */
    resetSpawnTimer(speed) {
        // 速度が上がるにつれて間隔を短縮
        const speedFactor = (speed - 320) / 430; // 0.0 〜 1.0
        const minTime = Math.max(0.9, 1.8 - speedFactor * 0.8);
        const maxTime = Math.max(1.6, 3.0 - speedFactor * 1.2);

        this.spawnTimer = minTime + Math.random() * (maxTime - minTime);
    }

    /**
     * 恐竜との衝突判定
     * @param {Array<{x: number, y: number, width: number, height: number}>} dinoHitboxes 
     * @returns {boolean}
     */
    checkCollision(dinoHitboxes) {
        for (const obs of this.obstacles) {
            const obsHitbox = obs.getHitbox();
            for (const dinoBox of dinoHitboxes) {
                if (intersects(dinoBox, obsHitbox)) {
                    return true;
                }
            }
        }
        return false;
    }

    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        for (const obs of this.obstacles) {
            obs.render(ctx);
        }
    }
}
