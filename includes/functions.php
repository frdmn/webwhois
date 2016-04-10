<?php
  function getIntegerIndexOfObjectKey($object, $needle){
    $i = 0;
    foreach ($object as $objectkey => $obj) {
      if ($objectkey === $needle) {
        return $i;
      }
      $i++;
    }
    return false;
  }
