// @ts-nocheck
import { createCanvas, loadImage } from 'canvas';
export class ImageGenerator {
    static async fetchImage(url) {
        try {
            return await loadImage(url);
        }
        catch {
            return null;
        }
    }
    static roundRect(ctx, x, y, w, h, r) {
        ctx.beginPath();
        ctx.moveTo(x + r, y);
        ctx.lineTo(x + w - r, y);
        ctx.quadraticCurveTo(x + w, y, x + w, y + r);
        ctx.lineTo(x + w, y + h - r);
        ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
        ctx.lineTo(x + r, y + h);
        ctx.quadraticCurveTo(x, y + h, x, y + h - r);
        ctx.lineTo(x, y + r);
        ctx.quadraticCurveTo(x, y, x + r, y);
        ctx.closePath();
    }
    static async generateRankCard(options) {
        const { username, avatar, level, xp, maxXp, rank, color = '#5865F2' } = options;
        const canvas = createCanvas(900, 250);
        const ctx = canvas.getContext('2d');
        // Background
        ctx.fillStyle = '#23272A';
        ImageGenerator.roundRect(ctx, 0, 0, 900, 250, 20);
        ctx.fill();
        // Optional background image
        if (options.backgroundUrl) {
            try {
                const bgImg = await loadImage(options.backgroundUrl);
                ctx.save();
                ImageGenerator.roundRect(ctx, 0, 0, 900, 250, 20);
                ctx.clip();
                ctx.globalAlpha = 0.3;
                ctx.drawImage(bgImg, 0, 0, 900, 250);
                ctx.globalAlpha = 1;
                ctx.restore();
            }
            catch { /* ignore */ }
        }
        // Overlay gradient
        const grad = ctx.createLinearGradient(0, 0, 900, 0);
        grad.addColorStop(0, 'rgba(0,0,0,0.7)');
        grad.addColorStop(1, 'rgba(0,0,0,0.3)');
        ImageGenerator.roundRect(ctx, 0, 0, 900, 250, 20);
        ctx.fillStyle = grad;
        ctx.fill();
        // Avatar circle
        const avatarImg = await ImageGenerator.fetchImage(avatar);
        if (avatarImg) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(120, 125, 80, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatarImg, 40, 45, 160, 160);
            ctx.restore();
            // Avatar border
            ctx.beginPath();
            ctx.arc(120, 125, 82, 0, Math.PI * 2);
            ctx.strokeStyle = color;
            ctx.lineWidth = 4;
            ctx.stroke();
        }
        // Username
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 36px Arial';
        ctx.fillText(username.slice(0, 20), 230, 100);
        // Rank & Level
        ctx.fillStyle = '#B9BBBE';
        ctx.font = '24px Arial';
        ctx.fillText(`Rank #${rank}`, 230, 140);
        ctx.fillStyle = color;
        ctx.font = 'bold 28px Arial';
        ctx.fillText(`Level ${level}`, 500, 100);
        // XP text
        ctx.fillStyle = '#B9BBBE';
        ctx.font = '20px Arial';
        ctx.fillText(`${xp.toLocaleString()} / ${maxXp.toLocaleString()} XP`, 230, 175);
        // Progress bar background
        ctx.fillStyle = '#484B4E';
        ImageGenerator.roundRect(ctx, 230, 190, 620, 25, 12);
        ctx.fill();
        // Progress bar fill
        const progress = Math.min(xp / maxXp, 1);
        if (progress > 0) {
            const barGrad = ctx.createLinearGradient(230, 0, 230 + 620 * progress, 0);
            barGrad.addColorStop(0, color);
            barGrad.addColorStop(1, '#ffffff44');
            ctx.fillStyle = barGrad;
            ImageGenerator.roundRect(ctx, 230, 190, Math.max(25, 620 * progress), 25, 12);
            ctx.fill();
        }
        // Percentage
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 16px Arial';
        ctx.fillText(`${Math.floor(progress * 100)}%`, 820, 208);
        return canvas.toBuffer('image/png');
    }
    static async generateWelcomeCard(options) {
        const { username, avatar, guildName, memberCount } = options;
        const canvas = createCanvas(800, 300);
        const ctx = canvas.getContext('2d');
        // Background
        const bgGrad = ctx.createLinearGradient(0, 0, 800, 300);
        bgGrad.addColorStop(0, '#1a1a2e');
        bgGrad.addColorStop(1, '#16213e');
        ctx.fillStyle = bgGrad;
        ctx.fillRect(0, 0, 800, 300);
        // Stars decoration
        ctx.fillStyle = 'rgba(255,255,255,0.3)';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * 800;
            const y = Math.random() * 300;
            const r = Math.random() * 2;
            ctx.beginPath();
            ctx.arc(x, y, r, 0, Math.PI * 2);
            ctx.fill();
        }
        // Avatar
        const avatarImg = await ImageGenerator.fetchImage(avatar);
        if (avatarImg) {
            ctx.save();
            ctx.beginPath();
            ctx.arc(150, 150, 90, 0, Math.PI * 2);
            ctx.closePath();
            ctx.clip();
            ctx.drawImage(avatarImg, 60, 60, 180, 180);
            ctx.restore();
            ctx.beginPath();
            ctx.arc(150, 150, 93, 0, Math.PI * 2);
            ctx.strokeStyle = '#5865F2';
            ctx.lineWidth = 5;
            ctx.stroke();
        }
        // Welcome text
        ctx.fillStyle = '#5865F2';
        ctx.font = 'bold 32px Arial';
        ctx.fillText('WELCOME!', 290, 100);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 40px Arial';
        const displayName = username.length > 16 ? username.slice(0, 16) + '...' : username;
        ctx.fillText(displayName, 290, 155);
        ctx.fillStyle = '#B9BBBE';
        ctx.font = '24px Arial';
        ctx.fillText(`to ${guildName}`, 290, 200);
        ctx.fillStyle = '#72767D';
        ctx.font = '20px Arial';
        ctx.fillText(`Member #${memberCount.toLocaleString()}`, 290, 240);
        return canvas.toBuffer('image/png');
    }
    static async generateWantedPoster(username, avatarUrl) {
        const canvas = createCanvas(400, 500);
        const ctx = canvas.getContext('2d');
        // Parchment background
        const bg = ctx.createLinearGradient(0, 0, 400, 500);
        bg.addColorStop(0, '#f5e6c8');
        bg.addColorStop(1, '#e8d4a2');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 400, 500);
        // Border
        ctx.strokeStyle = '#8B4513';
        ctx.lineWidth = 8;
        ctx.strokeRect(10, 10, 380, 480);
        ctx.strokeStyle = '#A0522D';
        ctx.lineWidth = 2;
        ctx.strokeRect(18, 18, 364, 464);
        // WANTED text
        ctx.fillStyle = '#8B0000';
        ctx.font = 'bold 60px serif';
        ctx.textAlign = 'center';
        ctx.fillText('WANTED', 200, 80);
        ctx.fillStyle = '#4a2c0a';
        ctx.font = 'bold 20px serif';
        ctx.fillText('DEAD OR ALIVE', 200, 108);
        // Avatar
        const avatarImg = await ImageGenerator.fetchImage(avatarUrl);
        if (avatarImg) {
            ctx.save();
            ctx.strokeStyle = '#8B4513';
            ctx.lineWidth = 3;
            ctx.strokeRect(80, 125, 240, 240);
            ctx.drawImage(avatarImg, 80, 125, 240, 240);
            ctx.restore();
        }
        // Name
        ctx.fillStyle = '#4a2c0a';
        ctx.font = 'bold 28px serif';
        ctx.fillText(username.slice(0, 18), 200, 410);
        ctx.font = 'bold 20px serif';
        ctx.fillText('REWARD: ₱50,000', 200, 445);
        ctx.font = '14px serif';
        ctx.fillStyle = '#6b4226';
        ctx.fillText('Contact local authorities if found', 200, 475);
        ctx.textAlign = 'left';
        return canvas.toBuffer('image/png');
    }
    static async generateCertificate(username, title, description) {
        const canvas = createCanvas(900, 600);
        const ctx = canvas.getContext('2d');
        // Background
        const bg = ctx.createLinearGradient(0, 0, 900, 600);
        bg.addColorStop(0, '#fdfbf7');
        bg.addColorStop(1, '#f5f0e8');
        ctx.fillStyle = bg;
        ctx.fillRect(0, 0, 900, 600);
        // Decorative border
        ctx.strokeStyle = '#C9A96E';
        ctx.lineWidth = 12;
        ctx.strokeRect(15, 15, 870, 570);
        ctx.strokeStyle = '#E8D5A3';
        ctx.lineWidth = 3;
        ctx.strokeRect(25, 25, 850, 550);
        // Corner ornaments
        ['top-left', 'top-right', 'bottom-left', 'bottom-right'].forEach((corner) => {
            const [cx, cy] = corner.includes('left') ? (corner.includes('top') ? [45, 45] : [45, 555]) : (corner.includes('top') ? [855, 45] : [855, 555]);
            ctx.beginPath();
            ctx.arc(cx, cy, 15, 0, Math.PI * 2);
            ctx.fillStyle = '#C9A96E';
            ctx.fill();
        });
        // Certificate of text
        ctx.textAlign = 'center';
        ctx.fillStyle = '#8B7355';
        ctx.font = 'italic 24px Georgia, serif';
        ctx.fillText('CERTIFICATE OF', 450, 120);
        ctx.fillStyle = '#4a3728';
        ctx.font = 'bold 52px Georgia, serif';
        ctx.fillText(title.toUpperCase(), 450, 185);
        // Divider
        ctx.strokeStyle = '#C9A96E';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(100, 210);
        ctx.lineTo(800, 210);
        ctx.stroke();
        // Body text
        ctx.fillStyle = '#6b5a4a';
        ctx.font = 'italic 22px Georgia, serif';
        ctx.fillText('This is to certify that', 450, 270);
        ctx.fillStyle = '#2c1810';
        ctx.font = 'bold 42px Georgia, serif';
        ctx.fillText(username, 450, 330);
        if (description) {
            ctx.fillStyle = '#6b5a4a';
            ctx.font = '20px Georgia, serif';
            const words = description.split(' ');
            let line = '';
            let y = 380;
            for (const word of words) {
                const test = line + word + ' ';
                if (ctx.measureText(test).width > 700 && line) {
                    ctx.fillText(line.trim(), 450, y);
                    line = word + ' ';
                    y += 30;
                }
                else
                    line = test;
            }
            if (line)
                ctx.fillText(line.trim(), 450, y);
        }
        // Date
        ctx.fillStyle = '#8B7355';
        ctx.font = '18px Georgia, serif';
        ctx.fillText(new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }), 450, 535);
        ctx.textAlign = 'left';
        return canvas.toBuffer('image/png');
    }
}
