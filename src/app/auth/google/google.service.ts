import User from '../../users/user.model'; // Ajusta la ruta a tu modelo
import AuthService from '../auth.service';

export default class GoogleAuthService {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  public async handleGoogleAuth(profile: any) {
    const email = profile.emails?.[0]?.value;
    const googleId = profile.id;
    const name = profile.displayName;
    const photo = profile.photos?.[0]?.value;

    if (!email) throw new Error('Google no proporcionó un email');

    let user = await User.findOne({ email });

    if (user) {
      // Usuario existe: Actualizamos GoogleID si falta
      let needsSave = false;
      if (!user.googleId) {
        user.googleId = googleId;
        needsSave = true;
      }
      if (!user.emailVerified) {
        user.emailVerified = true;
        needsSave = true;
      }
      if (needsSave) await user.save();
    } else {
      // Usuario nuevo: Lo creamos
      const randomPassword = Math.random().toString(36).slice(-8) + "Google!";
      
      user = new User({
        name: name,
        email: email,
        googleId: googleId,
        roles: ['customer'],
        emailVerified: true,
        avatarUrl: photo,
        password: randomPassword // Dummy password
      });
      await user.save();
    }

    // Generamos tokens (Recuerda: generateTokens debe ser PUBLIC en AuthService)
    const tokens = this.authService.generateTokens({
      userId: user!._id.toString(), // Convertimos ObjectId a String
      email: user.email,
      roles: user.roles as string[],
    });

    // Guardamos refresh token
    user.refreshToken = tokens.refreshToken;
    await user.save();

    return { user, tokens };
  }
}