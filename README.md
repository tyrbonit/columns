# Плагин Columns
#### от Майкла Эйзенбрауна

Плагин Columns это простой способ создания HTML таблицы на основе JSON данных, которая обладают сортировкой, поиском и функцией пагинации. Всё, что вам нужно, так это предоставить данные, плагин Columns сделает все остальное.

### Установка

Подключите к вашей веб-странице jQuery библиотеку версии 1.7 или выше и файл плагина Columns: 

```
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.0/jquery.min.js"></script>
<script src="js/jquery.columns.min.js"></script>
```

Подключите готовую тему оформления Columns или создайте собственную

```
<link rel="stylesheet" href="css/classic.css">
```

Так как Columns создает все необходимые HTML-тэги динамически, то в HTML-коде необходимо только добавить пустой HTML-элемент, например,  `<div>` тэг, имеющий соответствующий id для инициализации.

```
<div id="columns"></div>
```

К конце, выполните инициализацию Columns.

```
<script>
  $(document).ready(function() {
    var json = [{"col1":"row1", "col2":"row1", "col3":"row1"}, {"col1":"row2", "col2":"row2", "col3":"row2"}]; 
    $('#columns').columns({data:json});
  });
</script>
```

Больше информации смотрите полную документацию [на английском](http://eisenbraun.github.io/columns) и [перевод](https://github.com/tyrbonit/columns/wiki)
