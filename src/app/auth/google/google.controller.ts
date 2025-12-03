import { Request, Response } from 'express';

export const googleCallback = (req: Request, res: Response) => {
    const data = req.user as any;

    // Si hubo error, regresamos al login
    if (!data || !data.tokens) {
        return res.redirect('/login?error=auth_failed');
    }

    const { accessToken, refreshToken } = data.tokens;
    const user = data.user;

    // RENDERIZAMOS LA VISTA DE HANDLEBARS
    // Le pasamos los tokens como variables para que Handlebars los escriba en el HTML
    res.render('auth/google-success', { 
        layout: false, // Opcional: Para que no cargue el header/footer de tu sitio en esta pantalla de transición
        accessToken,
        refreshToken,
        user: JSON.stringify(user)
    });
};