import gulp from 'gulp'
import ts from 'gulp-typescript'
import copy from 'gulp-copy'

//Typescripts
const tsConfig = ts.createProject('tsconfig.json');
export const scripts = () => {
    return gulp
            .src('src/**/*.ts')
            .pipe(tsConfig())
            .pipe(gulp.dest('dist/src')) //guardar en dist
}
//Estilos



//Index.html
export const html = () => {
    return gulp
            .src('public/**/*.html')
            .pipe(copy('dist'))
}

//Assets
export const assets = () => {
    return gulp
            .src('public/**/*')
            .pipe(copy('dist'))
}

//Build
export const build = gulp.parallel(scripts,assets, html);

export default build;