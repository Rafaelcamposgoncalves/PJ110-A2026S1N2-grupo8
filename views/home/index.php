<?php
//força atualização do cache
header("Cache-Control: no-cache, must-revalidate"); // HTTP/1.1
header("Expires: Sat, 26 Jul 1997 05:00:00 GMT");    // Data no passado
?>


<script>
    // Usa a variável $base definida na raiz
    window.BASE_URL = window.location.origin + "<?php echo $base; ?>";
</script>


<!DOCTYPE html>
<html lang="pt-BR">

<head>
  <meta charset="UTF-8">
  <title>Dashboard</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <!-- Bootstrap CSS -->
  <link href="<?php echo $base; ?>/public/css/Bootstrap.css" rel="stylesheet">
  <!-- Font Awesome -->
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous">
  <!-- Choices.js -->
  <link rel="stylesheet" href="<?php echo $base; ?>/public/css/Choices.css" />

  <link rel="stylesheet" href="<?php echo $base; ?>/public/css/app.css?v=1.0.4">
  <link rel="stylesheet" href="<?php echo $base; ?>/public/css/home.css?v=1.0.4">
  <link rel="stylesheet" href="<?php echo $base; ?>/lib/rtimeline/css/rtimeline.css">
</head>

<body id="up">

<!-- NAVBAR FIXA -->
<nav class="navbar navbar-dark bg-dark fixed-top">
    <div class="container-fluid d-flex justify-content-between">
        <span class="navbar-brand mb-0"> Sistema de Controle de Laminação </span>
        
        <div class="d-flex align-items-center gap-3">
            <!-- MOBILE: Mostra apenas o ícone. O nome aparece ao tocar (Tooltip) -->
            <span class="text-white d-sm-none" 
                  id="usuario-mobile-tooltip" 
                  data-bs-toggle="tooltip" 
                  data-bs-placement="bottom" 
                  title="Carregando...">
                <i class="fa-solid fa-user"></i>
            </span>

            <!-- DESKTOP: Mostra o texto completo (Some em telas < 576px) -->
            <span id="usuario-logado" class="text-white small d-none d-sm-inline"></span>

            <button class="btn btn-outline-light btn-sm" onclick="logout()">
                <i class="fa-solid fa-door-open"></i>
            </button>
        </div>
    </div>
</nav>


  <div class="container-fluid">
    <div class="row">
      <!-- SIDEBAR FIXA (DESKTOP) -->
      <div class="sidebar d-none d-lg-block p-3">
        <ul class="nav nav-pills flex-column">
          <li class="nav-item">
            <button class="nav-link active w-100 text-start" data-bs-toggle="tab" data-bs-target="#dashboard" onclick="carregarDashboard()">
              <i class="fa-solid fa-chart-line"></i> Dashboard
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link w-100 text-start" data-bs-toggle="tab" data-bs-target="#pedido" onclick="carregarPedido()">
              <i class="fa-solid fa-box"></i> Pedido
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link w-100 text-start" data-bs-toggle="tab" data-bs-target="#status" onclick="carregarStatus()">
              <i class="fa-solid fa-list-check"></i> Status
            </button>
          </li>
          <li class="nav-item">
            <button class="nav-link w-100 text-start" data-bs-toggle="tab" data-bs-target="#shaper" onclick="carregarShaper()">
              <i class="fa-solid fa-mask-face"></i> Shaper/Cliente
            </button>
          </li>
        </ul>
      </div>

      <!-- CONTEÚDO PRINCIPAL -->
      <main class="main-content p-4">
        <div class="tab-content">
          <div class="tab-pane fade show active" id="dashboard">
            <div id="conteudo-dashboard"></div>
          </div>
          <div class="tab-pane fade" id="pedido">
            <div id="conteudo-pedido"></div>
          </div>
          <div class="tab-pane fade" id="status">
            <div id="conteudo-status"></div>
          </div>
          <div class="tab-pane fade" id="shaper">
            <div id="conteudo-shaper"></div>
          </div>
        </div>
      </main>
    </div>
  </div>

<!-- NAVBAR MOBILE -->
<nav class="d-lg-none fixed-bottom bg-white w-100 nav-bottom d-flex justify-content-center p-1" style="height: 50px;"> 
    
    <!-- align-items-stretch faz a div azul ocupar toda a altura da laranja -->
    <div class="d-flex align-items-stretch"> 
        
        <!-- h-100 faz a ul vermelha ocupar toda a altura da azul -->
        <ul class="nav nav-pills h-100"> 
            
            <li class="nav-item d-flex">
                <button class="nav-link active h-100" data-bs-toggle="tab" data-bs-target="#dashboard" onclick="carregarDashboard()">
                    <i class="fa-solid fa-chart-line fa-lg"></i>
                </button>
            </li>

            <li class="nav-item d-flex">
                <button class="nav-link h-100" data-bs-toggle="tab" data-bs-target="#pedido" onclick="carregarPedido()">
                    <i class="fa-solid fa-box fa-lg"></i>
                </button>
            </li>

            <li class="nav-item d-flex">
                <button class="nav-link h-100" data-bs-toggle="tab" data-bs-target="#status" onclick="carregarStatus()">
                    <i class="fa-solid fa-list-check fa-lg"></i>
                </button>
            </li>

            <li class="nav-item d-flex">
                <button class="nav-link h-100" data-bs-toggle="tab" data-bs-target="#shaper" onclick="carregarShaper()">
                    <i class="fa-solid fa-mask-face fa-lg"></i>
                </button>
            </li>

        </ul>
    </div>
</nav>


  <!-- TOAST GERAL ALERT -->
  <div class="toast-container position-fixed top-0 end-0 p-3">
    <div class="toast " id="alertToast" role="alert" aria-live="assertive" aria-atomic="true" data-bs-delay="5000">
      <div class="toast-header">
        <strong class="me-auto"><i class="fa-regular fa-bell me-2"></i> <span id="toast-title"></span></strong>
        <button type="button" class="btn-close" data-bs-dismiss="toast" aria-label="Close"></button>
      </div>
      <div class="toast-body">
        <span id="toast-text"></span>
      </div>
    </div>
  </div>

  <!--MODAL DETALHE DO PEDIDO-->
  <div class="modal fade" id="modalPedidoDetalhe" tabindex="-1">
    <div class="modal-dialog modal-md modal-dialog-centered">
      <div class="modal-content">

        <div class="modal-header">
          <h5 class="modal-title">
            <i class="fa-regular fa-trash-can"></i> Detalhe do Pedido
          </h5>
          <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
        </div>

        <div class="modal-body">
          <p>Detalhe</p>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn-primary" onclick="imprimirDetalhePedido()">
            <i class="fa-solid fa-print"></i> Imprimir / PDF
          </button>
          <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Fechar</button>
        </div>

      </div>
    </div>
  </div>



  <!-- SCRIPTS -->
  <script src="<?php echo $base; ?>/public/js/Bootstrap.js"></script>
  <script src="<?php echo $base; ?>/public/js/Choices.js"></script>
  <script src="<?php echo $base; ?>/public/js/Sortable.min.js"></script>
  <script src="<?php echo $base; ?>/public/js/app.js"></script>
  <script src="<?php echo $base; ?>/public/js/home.js"></script>
  <script src="<?php echo $base; ?>/public/js/shaper.js"></script>
  <script src="<?php echo $base; ?>/public/js/pedido-status.js"></script>
  <script src="<?php echo $base; ?>/public/js/pedido.js"></script>
  <script src="<?php echo $base; ?>/public/js/status.js"></script>
</body>

</html>