/**
 * 恐竜キャラクタークラス
 */

export class Dino {
    constructor(groundY = 250) {
        this.groundY = groundY;

        // サイズと位置
        this.width = 44;
        this.height = 48;
        this.x = 55;
        this.y = this.groundY - this.height;

        // 物理パラメータ
        this.vy = 0;
        this.gravity = 1800; // px/sec^2
        this.jumpVelocity = -620; // px/sec
        this.isGrounded = true;

        // アニメーション状態
        this.animTimer = 0;
        this.legState = 0; // 0: 左足前, 1: 右足前
        this.isDead = false;
    }

    /**
     * 状態リセット
     */
    reset() {
        this.y = this.groundY - this.height;
        this.vy = 0;
        this.isGrounded = true;
        this.animTimer = 0;
        this.legState = 0;
        this.isDead = false;
    }

    /**
     * ジャンプ実行
     * @returns {boolean} ジャンプに成功したか
     */
    jump() {
        if (this.isGrounded && !this.isDead) {
            this.vy = this.jumpVelocity;
            this.isGrounded = false;
            return true;
        }
        return false;
    }

    /**
     * 状態更新
     * @param {number} deltaTime 経過秒数
     * @param {number} speed 現在の走行速度
     */
    update(deltaTime, speed) {
        // ジャンプ・重力物理演算
        if (!this.isGrounded) {
            this.vy += this.gravity * deltaTime;
            this.y += this.vy * deltaTime;

            // 着地判定
            if (this.y >= this.groundY - this.height) {
                this.y = this.groundY - this.height;
                this.vy = 0;
                this.isGrounded = true;
            }
        }

        // 走行アニメーション（速度に連動してテンポアップ）
        if (this.isGrounded && !this.isDead) {
            const stepInterval = Math.max(0.06, 0.16 - (speed / 3000));
            this.animTimer += deltaTime;
            if (this.animTimer >= stepInterval) {
                this.animTimer = 0;
                this.legState = 1 - this.legState;
            }
        }
    }

    /**
     * 衝突判定用のマルチヒットボックスを取得（内側に縮小）
     * @returns {Array<{x: number, y: number, width: number, height: number}>}
     */
    getHitboxes() {
        return [
            // 頭部ボックス (飛び出た頭部分)
            {
                x: this.x + 22,
                y: this.y + 2,
                width: 20,
                height: 18
            },
            // 胴体・脚ボックス (胸から足元)
            {
                x: this.x + 8,
                y: this.y + 16,
                width: 28,
                height: 28
            }
        ];
    }

    /**
     * 恐竜の描画（Canvasベクターパス）
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);

        const color = '#535353';
        ctx.fillStyle = color;

        // 1. 頭部
        ctx.beginPath();
        ctx.roundRect(18, 0, 24, 18, [4, 4, 2, 2]);
        ctx.fill();

        // 鼻先・上顎
        ctx.fillRect(36, 6, 8, 10);

        // 口の切れ込み
        ctx.fillStyle = '#fdfdfd';
        ctx.fillRect(30, 13, 14, 3);
        ctx.fillStyle = color;

        // 2. 目
        if (this.isDead) {
            // やられ時の×目
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(25, 4);
            ctx.lineTo(29, 8);
            ctx.moveTo(29, 4);
            ctx.lineTo(25, 8);
            ctx.stroke();
        } else {
            // 通常の目
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(25, 4, 4, 4);
            ctx.fillStyle = color;
            ctx.fillRect(27, 4, 2, 2);
        }

        // 3. 首〜胴体
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.moveTo(18, 14);
        ctx.lineTo(34, 16);
        ctx.lineTo(34, 34);
        ctx.lineTo(8, 34);
        ctx.lineTo(10, 24);
        ctx.closePath();
        ctx.fill();

        // 4. 尻尾
        ctx.beginPath();
        ctx.moveTo(10, 24);
        ctx.lineTo(0, 18);
        ctx.lineTo(2, 28);
        ctx.lineTo(8, 32);
        ctx.closePath();
        ctx.fill();

        // 5. 前足（小さな可愛い腕）
        ctx.beginPath();
        ctx.moveTo(28, 22);
        ctx.lineTo(35, 23);
        ctx.lineTo(35, 26);
        ctx.lineTo(30, 26);
        ctx.closePath();
        ctx.fill();

        // 6. 後ろ足（アニメーション / ジャンプポーズ）
        this.renderLegs(ctx);

        ctx.restore();
    }

    /**
     * 足の描画
     */
    renderLegs(ctx) {
        ctx.fillStyle = '#535353';

        if (!this.isGrounded) {
            // ジャンプ時: 足を曲げたポーズ
            // 左足（曲げ）
            ctx.fillRect(16, 34, 4, 8);
            ctx.fillRect(20, 40, 5, 3);
            // 右足（曲げ）
            ctx.fillRect(24, 34, 4, 8);
            ctx.fillRect(28, 40, 5, 3);
        } else if (this.legState === 0) {
            // 走行コマA: 左足前、右足後ろ
            // 左足 (前進)
            ctx.fillRect(22, 34, 4, 14);
            ctx.fillRect(22, 45, 6, 3);
            // 右足 (後ろ・少し上)
            ctx.fillRect(12, 34, 4, 10);
            ctx.fillRect(10, 41, 5, 3);
        } else {
            // 走行コマB: 右足前、左足後ろ
            // 左足 (後ろ・少し上)
            ctx.fillRect(16, 34, 4, 10);
            ctx.fillRect(14, 41, 5, 3);
            // 右足 (前進)
            ctx.fillRect(26, 34, 4, 14);
            ctx.fillRect(26, 45, 6, 3);
        }
    }
}
