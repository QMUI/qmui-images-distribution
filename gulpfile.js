/**
 * gulpfile.js 按 QMUI 要求重命名切图并自动分发 
 *
 * @date 2016-06-18
 */

// 声明插件以及配置文件的依赖
var gulp        = require('gulp-help')(require('gulp'), {
                    description: '展示这个帮助菜单',
                    hideDepsMessage: true
                  }),
    fs          = require('fs-extra'),
    del         = require('del'),
    argv        = require('yargs').argv,
    path        = require('path'),
    plugins     = require('gulp-load-plugins')();

// 逻辑变量
var sourceDir = 'source', 
    targetKey = argv.d,
    targetDict,
    targetDir,
    prefixList = ['_2x', '_3x'];

gulp.task('default', '把 source 目录中的图片按倍数分发到特定目录', function(){

  try {
    var _data = fs.readFileSync('../config.json');  
    targetDict = JSON.parse(_data); 
    targetDir = '../' + targetDict[targetKey];
  } catch (_error) {
    if (_error.code === 'ENOENT') {
      plugins.util.log('找不到配置表 ' + plugins.util.colors.red(path.resolve('..') + '/config.json'));
      plugins.util.log('请先运行 ' + plugins.util.colors.red('gulp init') + ' 创建配置表，并在其中输入关键字和目录名的配对字典');
      return;
    } else {
        throw _error;
    }
  }

	var _files = fs.readdirSync(sourceDir);

	_files.forEach(function(_file) {

		var _fullPathSrc = path.join(sourceDir, _file),
        _statSrc = fs.statSync(_fullPathSrc),
        _prefixResult = ''; // 默认前缀为空，即当作一倍图处理

		if (_statSrc.isFile() && isImageFile(_file)) {

      // 前缀匹配，如果文件名中匹配了某个前缀，即按该前缀对应的 x 倍图处理图片
      prefixList.forEach(function(_prefix) {
        if (_file.toString().indexOf(_prefix) !== -1) {
          _prefixResult = _prefix;
          return;
        }
      });

      var _fullPathDest = path.join(targetDir + _prefixResult, _file.toString().replace(_prefixResult, ''));

      // forece 参数为 true 表明可以操作 index.js 所在目录更上层的目录内的文件
      fs.copySync(_fullPathSrc, _fullPathDest, { force: true });

      plugins.util.log('文件 ' + plugins.util.colors.yellow(_file) + ' 被同步处理为 ' + plugins.util.colors.green(_fullPathDest));

      // 清空原目录
      del('source/*.*');
		}
	});

}, {
  options: {
    'd': '需要分发到的目录关键字，例如需要分发到 icons 系列目录，即输入 icon，分发到 loginImages 目录，即输入 login'
  }
});

gulp.task('init', '初始使用时应该先运行一次该任务，该任务会在上层目录中创建配置表，创建完成后请在配置表中编写关键字与目录名的字典', function(){
  plugins.util.log('创建配置表 ' + plugins.util.colors.green(path.resolve('..') + '/config.json') + '，请在配置表中编写关键字与目录名的字典');
  return gulp.src('config.json')
             .pipe(gulp.dest('..'));
});


// 工具方法

// 从文件名判断是否为图片文件
var imagesExtensionNameList = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'bmp'];
var isImageFile = function(_file) {
  for(var _i in imagesExtensionNameList) {
    if (_file.toString().indexOf('\.' + imagesExtensionNameList[_i]) !== -1) {
      return true;
    }
  }
  return false;
}
