<?php
class Status {
    private $conn;
    private $table = "status";

    public function __construct($db) {
        $this->conn = $db;
    }

    public function listar() {
        $sql = "SELECT id_status AS id, descricao, ordem FROM {$this->table} ORDER BY ordem ASC";
        $stmt = $this->conn->prepare($sql);
        $stmt->execute();
        return $stmt->fetchAll(PDO::FETCH_ASSOC);
    }

    public function buscar($id) {
        $sql = "SELECT id_status AS id, descricao, ordem FROM {$this->table} WHERE id_status = :id";
        $stmt = $this->conn->prepare($sql);
        $stmt->bindParam(':id', $id);
        $stmt->execute();
        return $stmt->fetch(PDO::FETCH_ASSOC);
    }

    public function criar($descricao, $ordem) {
        $sql = "INSERT INTO {$this->table} (descricao, ordem) VALUES (:descricao, :ordem)";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([ ":descricao" => $descricao, ":ordem" => $ordem ]);
    }

    public function atualizar($id, $descricao, $ordem) {
        $sql = " UPDATE {$this->table} SET descricao = :descricao, ordem = :ordem WHERE id_status = :id ";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([ ":id" => $id, ":descricao" => $descricao, ":ordem" => $ordem ]);
    }

    public function deletar($id) {
        $sql = "DELETE FROM {$this->table} WHERE id_status = :id";
        $stmt = $this->conn->prepare($sql);
        return $stmt->execute([":id" => $id]);
    }

    // Método para encontrar o próximo status na fila
    public function buscarSequencia($idStatusAtual) {
        // 1. Pega a ordem do status atual
        $sqlAtual = "SELECT ordem FROM {$this->table} WHERE id_status = :id";
        $stmt = $this->conn->prepare($sqlAtual);
        $stmt->execute([':id' => $idStatusAtual]);
        $atual = $stmt->fetch(PDO::FETCH_ASSOC);

        if (!$atual) {
            // Se não há status anterior (pedido novo), pega o primeiro da ordem
            $sqlProx = "SELECT id_status, descricao FROM {$this->table} ORDER BY ordem ASC LIMIT 1";
            $stmtProx = $this->conn->prepare($sqlProx);
            $stmtProx->execute();
        } else {
            // Busca o próximo com ordem superior
            $sqlProx = "SELECT id_status, descricao FROM {$this->table} WHERE ordem > :ordem ORDER BY ordem ASC LIMIT 1";
            $stmtProx = $this->conn->prepare($sqlProx);
            $stmtProx->execute([':ordem' => $atual['ordem']]);
        }

        return $stmtProx->fetch(PDO::FETCH_ASSOC);
    }
} // <--- Esta chaveta deve ser sempre a última do ficheiro
