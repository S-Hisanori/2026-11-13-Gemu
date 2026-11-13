/**
 * 背景・地面・雲の描画およびスクロール管理クラス
 */

export class Background {
    constructor(logicalWidth = 800, logicalHeight = 300, groundY = 250) {
        this.width = logicalWidth;
        this.height = logicalHeight;
        this.groundY = groundY;

        // 地面スクロールオフセット
        this.groundOffset = 0;

        // 地面の装飾用小石・ドットの定義 (相対座標)
        this.groundBumpDistance = 1200; // ループ長
        this.groundBumps = [];
        this.initGroundBumps();

        // 雲のリスト
        this.clouds = [];
        this.initClouds();

        // 遠景の砂丘
        this.duneOffset = 0;
    }

    /**
     * 地面の小石・凹凸パターンの初期化
     */
    initGroundBumps() {
        this.groundBumps = [];
        const count = 45;
        for (let i = 0; i < count; i++) {
            this.groundBumps.push({
                x: (i / count) * this.groundBumpDistance + Math.random() * 15,
                y: this.groundY + 4 + Math.random() * 32,
                size: 1.5 + Math.random() * 3,
                type: Math.random() > 0.4 ? 'dot' : 'line'
            });
        }
    }

    /**
     * 雲の初期化
     */
    initClouds() {
        this.clouds = [
            { x: 120, y: 50, scale: 0.9, speedRatio: 0.15 },
            { x: 380, y: 80, scale: 0.7, speedRatio: 0.12 },
            { x: 620, y: 40, scale: 1.1, speedRatio: 0.18 },
            { x: 860, y: 70, scale: 0.8, speedRatio: 0.14 }
        ];
    }

    /**
     * 更新処理
     * @param {number} deltaTime 秒単位の経過時間
     * @param {number} speed 現在の走行速度 (px/sec)
     */
    update(deltaTime, speed) {
        // 地面のスクロール
        this.groundOffset += speed * deltaTime;
        if (this.groundOffset >= this.groundBumpDistance) {
            this.groundOffset %= this.groundBumpDistance;
        }

        // 遠景砂丘のスクロール（非常にゆっくり）
        this.duneOffset += speed * 0.05 * deltaTime;
        if (this.duneOffset >= 400) {
            this.duneOffset %= 400;
        }

        // 雲の移動
        for (const cloud of this.clouds) {
            cloud.x -= speed * cloud.speedRatio * deltaTime;
            // 画面左外に出たら右側へ再配置
            if (cloud.x < -120) {
                cloud.x = this.width + Math.random() * 100;
                cloud.y = 35 + Math.random() * 65;
                cloud.scale = 0.6 + Math.random() * 0.6;
            }
        }
    }

    /**
     * 描画処理
     * @param {CanvasRenderingContext2D} ctx 
     */
    render(ctx) {
        this.renderDunes(ctx);
        this.renderClouds(ctx);
        this.renderGround(ctx);
    }

    /**
     * 遠景砂丘の描画
     */
    renderDunes(ctx) {
        ctx.save();
        ctx.fillStyle = '#efefef';
        ctx.beginPath();
        const startX = - (this.duneOffset % 400);
        ctx.moveTo(startX, this.groundY);

        for (let x = startX; x < this.width + 400; x += 200) {
            ctx.quadraticCurveTo(x + 100, this.groundY - 35, x + 200, this.groundY);
        }

        ctx.lineTo(this.width, this.height);
        ctx.lineTo(0, this.height);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    /**
     * 雲の描画
     */
    renderClouds(ctx) {
        ctx.save();
        ctx.fillStyle = '#dcdcdc';
        for (const cloud of this.clouds) {
            this.drawSingleCloud(ctx, cloud.x, cloud.y, cloud.scale);
        }
        ctx.restore();
    }

    /**
     * 単一の雲の描画（角丸のふんわりした雲）
     */
    drawSingleCloud(ctx, x, y, scale) {
        ctx.save();
        ctx.translate(x, y);
        ctx.scale(scale, scale);

        ctx.beginPath();
        ctx.arc(20, 20, 16, 0, Math.PI * 2);
        ctx.arc(38, 12, 20, 0, Math.PI * 2);
        ctx.arc(60, 18, 16, 0, Math.PI * 2);
        ctx.arc(75, 24, 12, 0, Math.PI * 2);
        ctx.closePath();
        ctx.fill();

        // 雲の底面をフラットに
        ctx.fillRect(15, 18, 65, 12);

        ctx.restore();
    }

    /**
     * 地面と小石・テクスチャの描画
     */
    renderGround(ctx) {
        ctx.save();

        // 地平線のメインライン
        ctx.strokeStyle = '#535353';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, this.groundY);
        ctx.lineTo(this.width, this.groundY);
        ctx.stroke();

        // 地面の小石・凹凸
        ctx.fillStyle = '#777777';
        ctx.strokeStyle = '#777777';
        ctx.lineWidth = 1.5;

        for (const bump of this.groundBumps) {
            // スクロール適用後のX座標（ループ対応）
            let renderX = (bump.x - this.groundOffset) % this.groundBumpDistance;
            if (renderX < -20) {
                renderX += this.groundBumpDistance;
            }

            if (renderX <= this.width + 10) {
                if (bump.type === 'dot') {
                    ctx.beginPath();
                    ctx.arc(renderX, bump.y, bump.size, 0, Math.PI * 2);
                    ctx.fill();
                } else {
                    ctx.beginPath();
                    ctx.moveTo(renderX, bump.y);
                    ctx.lineTo(renderX + bump.size * 2.5, bump.y);
                    ctx.stroke();
                }
            }
        }

        ctx.restore();
    }
}
